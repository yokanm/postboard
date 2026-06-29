// src/__tests__/services/admin/admin.service.test.ts
//
// Unit tests for the platform admin service.
// All Prisma models, cache, and nanoid are mocked globally in setup.ts.

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as cache from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	adminDeactivateUserService,
	adminDeleteJobService,
	adminForceCloseJobService,
	adminListCompaniesService,
	adminListJobsService,
	adminListUsersService,
	adminVerifyCompanyService,
	getPlatformStatsService,
	listAuditLogsService,
	writeAuditLog,
} from "@/services/v1/admin/admin.service";

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockCompany = prisma.company as jest.Mocked<typeof prisma.company>;
const mockJob = prisma.job as jest.Mocked<typeof prisma.job>;
const mockApplication = prisma.jobApplication as jest.Mocked<
	typeof prisma.jobApplication
>;
const mockNotification = prisma.notification as jest.Mocked<
	typeof prisma.notification
>;
const mockAuditLog = (prisma as any).adminAuditLog as jest.Mocked<any>;
const mockRefreshToken = prisma.refreshToken as jest.Mocked<
	typeof prisma.refreshToken
>;

const invalidateJobListsSpy = jest.spyOn(cache, "invalidateJobLists");
const invalidateJobDetailSpy = jest.spyOn(cache, "invalidateJobDetail");

// ─── writeAuditLog ─────────────────────────────────────────────────────────────

describe("writeAuditLog", () => {
	beforeEach(() => {
		mockAuditLog.create.mockResolvedValue({});
	});

	it("creates an audit log record with the correct fields", async () => {
		await writeAuditLog("admin-1", "DELETE_USER", "USER", "user-99", {
			role: "CANDIDATE",
		});
		expect(mockAuditLog.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					actorId: "admin-1",
					action: "DELETE_USER",
					targetType: "USER",
					targetId: "user-99",
					metadata: { role: "CANDIDATE" },
				}),
			}),
		);
	});

	it("does not throw when the DB write fails — audit must never crash main flow", async () => {
		mockAuditLog.create.mockRejectedValue(new Error("DB down"));
		await expect(
			writeAuditLog("admin-1", "ACTION", "TYPE", "id"),
		).resolves.toBeUndefined();
	});

	it("generates a nanoid for the record id", async () => {
		await writeAuditLog("admin-1", "ACTION", "TYPE", "id");
		const callArg = mockAuditLog.create.mock.calls[0]?.[0] as {
			data: { id: string };
		};
		expect(callArg.data.id).toBeDefined();
		expect(typeof callArg.data.id).toBe("string");
	});
});

// ─── getPlatformStatsService ───────────────────────────────────────────────────

describe("getPlatformStatsService", () => {
	beforeEach(() => {
		// count() is called 8 times — each call resolves to a different number
		mockUser.count.mockResolvedValue(10);
		mockCompany.count.mockResolvedValue(5);
		mockJob.count
			.mockResolvedValueOnce(30) // totalJobs
			.mockResolvedValueOnce(12); // openJobs
		mockApplication.count
			.mockResolvedValueOnce(50) // totalApplications
			.mockResolvedValueOnce(20); // pendingApplications
		mockNotification.count
			.mockResolvedValueOnce(100) // totalNotifications
			.mockResolvedValueOnce(15); // unreadNotifications
	});

	it("returns aggregated platform statistics", async () => {
		const result = await getPlatformStatsService();

		expect(result.users.total).toBe(10);
		expect(result.companies.total).toBe(5);
		expect(result.jobs.total).toBe(30);
		expect(result.jobs.open).toBe(12);
		expect(result.applications.total).toBe(50);
		expect(result.applications.pending).toBe(20);
		expect(result.notifications.total).toBe(100);
		expect(result.notifications.unread).toBe(15);
	});

	it("includes a generatedAt ISO timestamp", async () => {
		const result = await getPlatformStatsService();
		expect(result.generatedAt).toBeDefined();
		expect(() => new Date(result.generatedAt)).not.toThrow();
	});
});

// ─── adminListUsersService ─────────────────────────────────────────────────────

describe("adminListUsersService", () => {
	const fakeUsers = [
		{
			id: "user-1",
			userName: "alice",
			email: "alice@x.com",
			role: "CANDIDATE",
			isVerified: true,
			firstName: "Alice",
			lastName: "Smith",
			companyId: null,
			createdAt: new Date(),
		},
		{
			id: "user-2",
			userName: "bob",
			email: "bob@x.com",
			role: "RECRUITER",
			isVerified: false,
			firstName: "Bob",
			lastName: "Jones",
			companyId: "c-1",
			createdAt: new Date(),
		},
	];

	beforeEach(() => {
		mockUser.findMany.mockResolvedValue(fakeUsers as any);
	});

	it("returns users and pagination metadata", async () => {
		const result = await adminListUsersService();
		expect(result.users).toHaveLength(2);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("filters by role when provided", async () => {
		await adminListUsersService(undefined, 20, "CANDIDATE");
		expect(mockUser.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ role: "CANDIDATE" }),
			}),
		);
	});

	it("applies search filter across email, userName, firstName", async () => {
		await adminListUsersService(undefined, 20, undefined, "alice");
		expect(mockUser.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ OR: expect.any(Array) }),
			}),
		);
	});

	it("paginates when there are more results than limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...fakeUsers[0],
			id: `user-${i}`,
		}));
		mockUser.findMany.mockResolvedValue(many as any);
		const result = await adminListUsersService(undefined, 20);
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("user-19");
		expect(result.users).toHaveLength(20);
	});

	it("caps limit at 100", async () => {
		await adminListUsersService(undefined, 999);
		expect(mockUser.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ take: 101 }),
		);
	});
});

// ─── adminDeactivateUserService ────────────────────────────────────────────────

describe("adminDeactivateUserService", () => {
	const targetUser = { id: "user-99", deletedAt: null, role: "CANDIDATE" };

	beforeEach(() => {
		mockUser.findUnique.mockResolvedValue(targetUser as any);
		mockAuditLog.create.mockResolvedValue({});
		// $transaction mock is already set up in setup.ts
		(prisma.$transaction as jest.MockedFunction<any>).mockResolvedValue([
			{},
			{ count: 1 },
		]);
	});

	it("runs deactivation inside a transaction", async () => {
		await adminDeactivateUserService("admin-1", "user-99");
		expect(prisma.$transaction).toHaveBeenCalled();
	});

	it("throws 400 when admin tries to deactivate themselves", async () => {
		await expect(
			adminDeactivateUserService("same-id", "same-id"),
		).rejects.toThrow(
			new AppError("You cannot deactivate your own account.", 400),
		);
	});

	it("throws 404 when user is not found", async () => {
		mockUser.findUnique.mockResolvedValue(null);
		await expect(
			adminDeactivateUserService("admin-1", "bad-id"),
		).rejects.toThrow(new AppError("User not found.", 404));
	});

	it("throws 404 when user is already soft-deleted", async () => {
		mockUser.findUnique.mockResolvedValue({
			...targetUser,
			deletedAt: new Date(),
		} as any);
		await expect(
			adminDeactivateUserService("admin-1", "user-99"),
		).rejects.toThrow(new AppError("User not found.", 404));
	});

	it("throws 403 when target is another admin", async () => {
		mockUser.findUnique.mockResolvedValue({
			...targetUser,
			role: "ADMIN",
		} as any);
		await expect(
			adminDeactivateUserService("admin-1", "user-99"),
		).rejects.toThrow(new AppError("Cannot deactivate another admin.", 403));
	});
});

// ─── adminListCompaniesService ─────────────────────────────────────────────────

describe("adminListCompaniesService", () => {
	const fakeCompanies = [
		{
			id: "c-1",
			name: "Acme",
			slug: "acme",
			email: "a@acme.com",
			industry: null,
			size: null,
			isVerified: true,
			createdAt: new Date(),
			_count: { jobs: 3, users: 2 },
		},
	];

	beforeEach(() => {
		mockCompany.findMany.mockResolvedValue(fakeCompanies as any);
	});

	it("returns companies and pagination metadata", async () => {
		const result = await adminListCompaniesService();
		expect(result.companies).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
	});

	it("filters by verified flag", async () => {
		await adminListCompaniesService(undefined, 20, undefined, "true");
		expect(mockCompany.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ isVerified: true }),
			}),
		);
	});

	it("filters by unverified flag", async () => {
		await adminListCompaniesService(undefined, 20, undefined, "false");
		expect(mockCompany.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ isVerified: false }),
			}),
		);
	});

	it("applies search filter on name and email", async () => {
		await adminListCompaniesService(undefined, 20, "acme");
		expect(mockCompany.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ OR: expect.any(Array) }),
			}),
		);
	});
});

// ─── adminVerifyCompanyService ─────────────────────────────────────────────────

describe("adminVerifyCompanyService", () => {
	const fakeCompany = { id: "c-1", deletedAt: null, isVerified: false };

	beforeEach(() => {
		mockCompany.findUnique.mockResolvedValue(fakeCompany as any);
		mockCompany.update.mockResolvedValue({
			...fakeCompany,
			isVerified: true,
		} as any);
		mockAuditLog.create.mockResolvedValue({});
	});

	it("marks the company as verified", async () => {
		await adminVerifyCompanyService("admin-1", "c-1");
		expect(mockCompany.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "c-1" },
				data: { isVerified: true },
			}),
		);
	});

	it("throws 404 when company not found", async () => {
		mockCompany.findUnique.mockResolvedValue(null);
		await expect(adminVerifyCompanyService("admin-1", "bad")).rejects.toThrow(
			new AppError("Company not found.", 404),
		);
	});

	it("throws 404 when company is soft-deleted", async () => {
		mockCompany.findUnique.mockResolvedValue({
			...fakeCompany,
			deletedAt: new Date(),
		} as any);
		await expect(adminVerifyCompanyService("admin-1", "c-1")).rejects.toThrow(
			new AppError("Company not found.", 404),
		);
	});

	it("throws 409 when company is already verified", async () => {
		mockCompany.findUnique.mockResolvedValue({
			...fakeCompany,
			isVerified: true,
		} as any);
		await expect(adminVerifyCompanyService("admin-1", "c-1")).rejects.toThrow(
			new AppError("Company is already verified.", 409),
		);
	});
});

// ─── adminListJobsService ──────────────────────────────────────────────────────

describe("adminListJobsService", () => {
	const fakeJobs = [
		{
			id: "job-1",
			title: "Engineer",
			slug: "engineer",
			status: "OPEN",
			locationType: "REMOTE",
			experienceLevel: "MID",
			createdAt: new Date(),
			expiresAt: null,
			company: { id: "c-1", name: "Acme" },
			_count: { applications: 5 },
		},
	];

	beforeEach(() => {
		mockJob.findMany.mockResolvedValue(fakeJobs as any);
	});

	it("returns jobs with pagination metadata", async () => {
		const result = await adminListJobsService();
		expect(result.jobs).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
	});

	it("filters by status when provided", async () => {
		await adminListJobsService(undefined, 20, "OPEN");
		expect(mockJob.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ status: "OPEN" }),
			}),
		);
	});

	it("applies title search filter", async () => {
		await adminListJobsService(undefined, 20, undefined, "engineer");
		expect(mockJob.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					title: expect.objectContaining({ contains: "engineer" }),
				}),
			}),
		);
	});
});

// ─── adminForceCloseJobService ─────────────────────────────────────────────────

describe("adminForceCloseJobService", () => {
	const openJob = {
		id: "job-1",
		status: "OPEN",
		title: "Engineer",
		companyId: "c-1",
	};

	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue(openJob as any);
		mockJob.update.mockResolvedValue({ ...openJob, status: "CLOSED" } as any);
		mockAuditLog.create.mockResolvedValue({});
		(invalidateJobListsSpy as jest.MockedFunction<any>).mockResolvedValue(
			undefined,
		);
		(invalidateJobDetailSpy as jest.MockedFunction<any>).mockResolvedValue(
			undefined,
		);
	});

	it("closes an OPEN job", async () => {
		await adminForceCloseJobService("admin-1", "job-1");
		expect(mockJob.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "job-1" },
				data: expect.objectContaining({ status: "CLOSED" }),
			}),
		);
	});

	it("invalidates job caches after closing", async () => {
		await adminForceCloseJobService("admin-1", "job-1");
		expect(invalidateJobListsSpy).toHaveBeenCalled();
		expect(invalidateJobDetailSpy).toHaveBeenCalledWith("job-1");
	});

	it("throws 404 when job not found", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(
			adminForceCloseJobService("admin-1", "bad-id"),
		).rejects.toThrow(new AppError("Job not found.", 404));
	});

	it("throws 409 when job is already CLOSED", async () => {
		mockJob.findUnique.mockResolvedValue({
			...openJob,
			status: "CLOSED",
		} as any);
		await expect(adminForceCloseJobService("admin-1", "job-1")).rejects.toThrow(
			new AppError("Job is already CLOSED.", 409),
		);
	});

	it("throws 409 when job is EXPIRED", async () => {
		mockJob.findUnique.mockResolvedValue({
			...openJob,
			status: "EXPIRED",
		} as any);
		await expect(adminForceCloseJobService("admin-1", "job-1")).rejects.toThrow(
			new AppError("Job is already EXPIRED.", 409),
		);
	});
});

// ─── adminDeleteJobService ─────────────────────────────────────────────────────

describe("adminDeleteJobService", () => {
	const activeJob = { id: "job-1", title: "Engineer" };

	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue(activeJob as any);
		mockJob.update.mockResolvedValue({
			...activeJob,
			deletedAt: new Date(),
			status: "CLOSED",
		} as any);
		mockAuditLog.create.mockResolvedValue({});
		(invalidateJobListsSpy as jest.MockedFunction<any>).mockResolvedValue(
			undefined,
		);
		(invalidateJobDetailSpy as jest.MockedFunction<any>).mockResolvedValue(
			undefined,
		);
	});

	it("soft-deletes the job", async () => {
		await adminDeleteJobService("admin-1", "job-1");
		expect(mockJob.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "job-1" },
				data: expect.objectContaining({
					deletedAt: expect.any(Date),
					status: "CLOSED",
				}),
			}),
		);
	});

	it("invalidates job caches", async () => {
		await adminDeleteJobService("admin-1", "job-1");
		expect(invalidateJobListsSpy).toHaveBeenCalled();
		expect(invalidateJobDetailSpy).toHaveBeenCalledWith("job-1");
	});

	it("throws 404 when job not found", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(adminDeleteJobService("admin-1", "bad-id")).rejects.toThrow(
			new AppError("Job not found.", 404),
		);
	});
});

// ─── listAuditLogsService ──────────────────────────────────────────────────────

describe("listAuditLogsService", () => {
	const fakeLogs = [
		{
			id: "log-1",
			actorId: "admin-1",
			action: "DELETE_USER",
			targetType: "USER",
			targetId: "user-99",
			metadata: null,
			createdAt: new Date(),
		},
		{
			id: "log-2",
			actorId: "admin-1",
			action: "VERIFY_COMPANY",
			targetType: "COMPANY",
			targetId: "c-1",
			metadata: null,
			createdAt: new Date(),
		},
	];

	beforeEach(() => {
		mockAuditLog.findMany.mockResolvedValue(fakeLogs);
	});

	it("returns logs and pagination metadata", async () => {
		const result = await listAuditLogsService();
		expect(result.logs).toHaveLength(2);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("filters by actorId when provided", async () => {
		await listAuditLogsService(undefined, 20, "admin-1");
		expect(mockAuditLog.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ actorId: "admin-1" }),
			}),
		);
	});

	it("filters by action when provided", async () => {
		await listAuditLogsService(undefined, 20, undefined, "DELETE_USER");
		expect(mockAuditLog.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ action: "DELETE_USER" }),
			}),
		);
	});

	it("filters by targetType when provided", async () => {
		await listAuditLogsService(undefined, 20, undefined, undefined, "USER");
		expect(mockAuditLog.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ targetType: "USER" }),
			}),
		);
	});

	it("paginates when results exceed limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...fakeLogs[0],
			id: `log-${i}`,
		}));
		mockAuditLog.findMany.mockResolvedValue(many);
		const result = await listAuditLogsService(undefined, 20);
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("log-19");
		expect(result.logs).toHaveLength(20);
	});
});
