// src/__tests__/services/notifications/notification.service.test.ts
//
// Unit tests for the notification service (both company and user sides).
// Prisma is mocked in setup.ts. The cache module is also mocked there, but
// we spy on individual functions below to assert call behaviour.

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as cache from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	createUserNotificationService,
	deleteCompanyNotificationService,
	deleteUserNotificationService,
	getCompanyUnreadCountService,
	getUserUnreadCountService,
	listCompanyNotificationsService,
	listUserNotificationsService,
	markCompanyNotificationsReadService,
	markSingleCompanyNotificationReadService,
	markUserNotificationsReadService,
} from "@/services/v1/notifications/notification.service";

const mockNotification = prisma.notification as jest.Mocked<
	typeof prisma.notification
>;

// Spies on the cache helpers mocked in setup.ts
const cacheGetSpy = jest.spyOn(cache, "cacheGet" as any);
const cacheSetSpy = jest.spyOn(cache, "cacheSet" as any);
const cacheDelSpy = jest.spyOn(cache, "cacheDel" as any);

const baseNotif = {
	id: "notif-1",
	type: "APPLICATION_RECEIVED",
	message: "New application for your job",
	metadata: null,
	isRead: false,
	createdAt: new Date(),
};

// ─── listCompanyNotificationsService ──────────────────────────────────────────

describe("listCompanyNotificationsService", () => {
	beforeEach(() => {
		mockNotification.findMany.mockResolvedValue([baseNotif] as any);
	});

	it("returns notifications and pagination metadata", async () => {
		const result = await listCompanyNotificationsService("company-1");
		expect(result.notifications).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("sets hasNextPage true when results exceed the limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...baseNotif,
			id: `notif-${i}`,
		}));
		mockNotification.findMany.mockResolvedValue(many as any);
		const result = await listCompanyNotificationsService(
			"company-1",
			undefined,
			20,
		);
		expect(result.hasNextPage).toBe(true);
		expect(result.notifications).toHaveLength(20);
		expect(result.nextCursor).toBe("notif-19");
	});

	it("filters by unreadOnly when flag is true", async () => {
		await listCompanyNotificationsService("company-1", undefined, 20, true);
		expect(mockNotification.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ isRead: false }),
			}),
		);
	});

	it("passes cursor for pagination", async () => {
		await listCompanyNotificationsService("company-1", "notif-5", 20);
		expect(mockNotification.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ cursor: { id: "notif-5" }, skip: 1 }),
		);
	});

	it("caps limit at 100", async () => {
		await listCompanyNotificationsService("company-1", undefined, 999);
		expect(mockNotification.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ take: 101 }), // 100 + 1 sentinel
		);
	});
});

// ─── getCompanyUnreadCountService ─────────────────────────────────────────────

describe("getCompanyUnreadCountService", () => {
	beforeEach(() => {
		(cacheGetSpy as jest.MockedFunction<any>).mockResolvedValue(null);
		(cacheSetSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
		mockNotification.count.mockResolvedValue(3);
	});

	it("returns the DB count when cache is cold", async () => {
		const count = await getCompanyUnreadCountService("company-1");
		expect(count).toBe(3);
		expect(mockNotification.count).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { companyId: "company-1", isRead: false },
			}),
		);
	});

	it("returns cached value without hitting the DB", async () => {
		(cacheGetSpy as jest.MockedFunction<any>).mockResolvedValue(7);
		const count = await getCompanyUnreadCountService("company-1");
		expect(count).toBe(7);
		expect(mockNotification.count).not.toHaveBeenCalled();
	});

	it("writes the DB result into cache", async () => {
		await getCompanyUnreadCountService("company-1");
		expect(cacheSetSpy).toHaveBeenCalledWith(
			expect.stringContaining("company-1"),
			3,
			expect.any(Number),
		);
	});
});

// ─── markCompanyNotificationsReadService ──────────────────────────────────────

describe("markCompanyNotificationsReadService", () => {
	beforeEach(() => {
		mockNotification.updateMany.mockResolvedValue({ count: 2 });
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("marks all unread notifications when no IDs given", async () => {
		await markCompanyNotificationsReadService("company-1");
		expect(mockNotification.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					companyId: "company-1",
					isRead: false,
				}),
				data: { isRead: true },
			}),
		);
	});

	it("marks only specified IDs when provided", async () => {
		await markCompanyNotificationsReadService("company-1", [
			"notif-1",
			"notif-2",
		]);
		expect(mockNotification.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ id: { in: ["notif-1", "notif-2"] } }),
			}),
		);
	});

	it("invalidates the cached unread count", async () => {
		await markCompanyNotificationsReadService("company-1");
		expect(cacheDelSpy).toHaveBeenCalledWith(
			expect.stringContaining("company-1"),
		);
	});
});

// ─── markSingleCompanyNotificationReadService ─────────────────────────────────

describe("markSingleCompanyNotificationReadService", () => {
	beforeEach(() => {
		mockNotification.findUnique.mockResolvedValue({
			companyId: "company-1",
			isRead: false,
		} as any);
		mockNotification.update.mockResolvedValue({
			...baseNotif,
			isRead: true,
		} as any);
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("marks a single notification as read and returns it", async () => {
		const result = await markSingleCompanyNotificationReadService(
			"company-1",
			"notif-1",
		);
		expect(result).toMatchObject({ isRead: true });
		expect(mockNotification.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "notif-1" },
				data: { isRead: true },
			}),
		);
	});

	it("invalidates cache after marking read", async () => {
		await markSingleCompanyNotificationReadService("company-1", "notif-1");
		expect(cacheDelSpy).toHaveBeenCalledWith(
			expect.stringContaining("company-1"),
		);
	});

	it("throws 404 when notification does not exist", async () => {
		mockNotification.findUnique.mockResolvedValue(null);
		await expect(
			markSingleCompanyNotificationReadService("company-1", "bad-id"),
		).rejects.toThrow(new AppError("Notification not found.", 404));
	});

	it("throws 403 when notification belongs to a different company", async () => {
		mockNotification.findUnique.mockResolvedValue({
			companyId: "other-company",
			isRead: false,
		} as any);
		await expect(
			markSingleCompanyNotificationReadService("company-1", "notif-1"),
		).rejects.toThrow(
			new AppError("You do not have access to this notification.", 403),
		);
	});
});

// ─── deleteCompanyNotificationService ─────────────────────────────────────────

describe("deleteCompanyNotificationService", () => {
	beforeEach(() => {
		mockNotification.findUnique.mockResolvedValue({
			companyId: "company-1",
		} as any);
		mockNotification.delete.mockResolvedValue(baseNotif as any);
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("deletes the notification and invalidates cache", async () => {
		await deleteCompanyNotificationService("company-1", "notif-1");
		expect(mockNotification.delete).toHaveBeenCalledWith({
			where: { id: "notif-1" },
		});
		expect(cacheDelSpy).toHaveBeenCalledWith(
			expect.stringContaining("company-1"),
		);
	});

	it("throws 404 when notification not found", async () => {
		mockNotification.findUnique.mockResolvedValue(null);
		await expect(
			deleteCompanyNotificationService("company-1", "bad-id"),
		).rejects.toThrow(new AppError("Notification not found.", 404));
	});

	it("throws 403 when notification belongs to another company", async () => {
		mockNotification.findUnique.mockResolvedValue({
			companyId: "other-company",
		} as any);
		await expect(
			deleteCompanyNotificationService("company-1", "notif-1"),
		).rejects.toThrow(
			new AppError("You do not have access to this notification.", 403),
		);
	});
});

// ─── listUserNotificationsService ─────────────────────────────────────────────

describe("listUserNotificationsService", () => {
	beforeEach(() => {
		mockNotification.findMany.mockResolvedValue([baseNotif] as any);
	});

	it("returns notifications for the user", async () => {
		const result = await listUserNotificationsService("user-1");
		expect(result.notifications).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
	});

	it("filters to unread when flag is set", async () => {
		await listUserNotificationsService("user-1", undefined, 20, true);
		expect(mockNotification.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: "user-1", isRead: false }),
			}),
		);
	});

	it("paginates when more items than limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...baseNotif,
			id: `notif-${i}`,
		}));
		mockNotification.findMany.mockResolvedValue(many as any);
		const result = await listUserNotificationsService("user-1", undefined, 20);
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("notif-19");
	});
});

// ─── getUserUnreadCountService ─────────────────────────────────────────────────

describe("getUserUnreadCountService", () => {
	beforeEach(() => {
		(cacheGetSpy as jest.MockedFunction<any>).mockResolvedValue(null);
		(cacheSetSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
		mockNotification.count.mockResolvedValue(5);
	});

	it("returns DB count on cache miss", async () => {
		const count = await getUserUnreadCountService("user-1");
		expect(count).toBe(5);
	});

	it("returns cached count without querying DB", async () => {
		(cacheGetSpy as jest.MockedFunction<any>).mockResolvedValue(2);
		const count = await getUserUnreadCountService("user-1");
		expect(count).toBe(2);
		expect(mockNotification.count).not.toHaveBeenCalled();
	});

	it("caches the count after a DB read", async () => {
		await getUserUnreadCountService("user-1");
		expect(cacheSetSpy).toHaveBeenCalledWith(
			expect.stringContaining("user-1"),
			5,
			expect.any(Number),
		);
	});
});

// ─── markUserNotificationsReadService ─────────────────────────────────────────

describe("markUserNotificationsReadService", () => {
	beforeEach(() => {
		mockNotification.updateMany.mockResolvedValue({ count: 1 });
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("marks all user notifications read when no IDs provided", async () => {
		await markUserNotificationsReadService("user-1");
		expect(mockNotification.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: "user-1", isRead: false }),
				data: { isRead: true },
			}),
		);
	});

	it("marks only specified IDs", async () => {
		await markUserNotificationsReadService("user-1", ["notif-1"]);
		expect(mockNotification.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ id: { in: ["notif-1"] } }),
			}),
		);
	});

	it("invalidates the cached unread count", async () => {
		await markUserNotificationsReadService("user-1");
		expect(cacheDelSpy).toHaveBeenCalledWith(expect.stringContaining("user-1"));
	});
});

// ─── deleteUserNotificationService ────────────────────────────────────────────

describe("deleteUserNotificationService", () => {
	beforeEach(() => {
		mockNotification.findUnique.mockResolvedValue({ userId: "user-1" } as any);
		mockNotification.delete.mockResolvedValue(baseNotif as any);
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("deletes notification and invalidates cache", async () => {
		await deleteUserNotificationService("user-1", "notif-1");
		expect(mockNotification.delete).toHaveBeenCalledWith({
			where: { id: "notif-1" },
		});
		expect(cacheDelSpy).toHaveBeenCalledWith(expect.stringContaining("user-1"));
	});

	it("throws 404 when notification not found", async () => {
		mockNotification.findUnique.mockResolvedValue(null);
		await expect(
			deleteUserNotificationService("user-1", "bad-id"),
		).rejects.toThrow(new AppError("Notification not found.", 404));
	});

	it("throws 404 when notification belongs to a different user", async () => {
		mockNotification.findUnique.mockResolvedValue({
			userId: "other-user",
		} as any);
		await expect(
			deleteUserNotificationService("user-1", "notif-1"),
		).rejects.toThrow(new AppError("Notification not found.", 404));
	});
});

// ─── createUserNotificationService ────────────────────────────────────────────

describe("createUserNotificationService", () => {
	beforeEach(() => {
		mockNotification.create.mockResolvedValue(baseNotif as any);
		(cacheDelSpy as jest.MockedFunction<any>).mockResolvedValue(undefined);
	});

	it("creates a notification for the user", async () => {
		await createUserNotificationService(
			"user-1",
			"APPLICATION_STATUS_CHANGED",
			"Your status changed",
		);
		expect(mockNotification.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					userId: "user-1",
					type: "APPLICATION_STATUS_CHANGED",
					message: "Your status changed",
				}),
			}),
		);
	});

	it("includes optional metadata when provided", async () => {
		await createUserNotificationService("user-1", "TEST", "msg", {
			jobId: "job-1",
		});
		expect(mockNotification.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ metadata: { jobId: "job-1" } }),
			}),
		);
	});

	it("invalidates the cached unread count after creation", async () => {
		await createUserNotificationService("user-1", "TEST", "msg");
		expect(cacheDelSpy).toHaveBeenCalledWith(expect.stringContaining("user-1"));
	});

	it("does not throw when create fails — swallows the error", async () => {
		mockNotification.create.mockRejectedValue(new Error("DB error"));
		await expect(
			createUserNotificationService("user-1", "TEST", "msg"),
		).resolves.toBeUndefined();
	});
});
