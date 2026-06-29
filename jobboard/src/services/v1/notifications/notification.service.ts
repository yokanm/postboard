// src/services/v1/notifications/notification.service.ts
// Phase 8: Full notifications API for both companies and users.
//
// DESIGN:
//   - Companies receive notifications about job activity and applications.
//   - Users (candidates) receive notifications about their application status.
//   - Both support cursor-based pagination and bulk-mark-as-read.
//   - Unread counts are cached in Redis with a short TTL to keep dashboards fast.

import { cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";

const UNREAD_COUNT_TTL = 30; // seconds — short TTL so count feels live

// ─── Cache key helpers ─────────────────────────────────────────────────────────

const companyUnreadKey = (companyId: string) =>
	`notif:unread:company:${companyId}`;
const userUnreadKey = (userId: string) => `notif:unread:user:${userId}`;

// ─── Company notifications ─────────────────────────────────────────────────────

export const listCompanyNotificationsService = async (
	companyId: string,
	cursor?: string,
	limit = 20,
	unreadOnly = false,
) => {
	const take = Math.min(limit, 100);

	const notifications = await prisma.notification.findMany({
		where: {
			companyId,
			...(unreadOnly && { isRead: false }),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			type: true,
			message: true,
			metadata: true,
			isRead: true,
			createdAt: true,
		},
	});

	const hasNextPage = notifications.length > take;
	const items = hasNextPage ? notifications.slice(0, -1) : notifications;

	return {
		notifications: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

export const getCompanyUnreadCountService = async (
	companyId: string,
): Promise<number> => {
	const key = companyUnreadKey(companyId);
	const cached = await cacheGet<number>(key);
	if (cached !== null) return cached;

	const count = await prisma.notification.count({
		where: { companyId, isRead: false },
	});

	void cacheSet(key, count, UNREAD_COUNT_TTL);
	return count;
};

export const markCompanyNotificationsReadService = async (
	companyId: string,
	notificationIds?: string[], // if omitted — mark ALL as read
) => {
	await prisma.notification.updateMany({
		where: {
			companyId,
			isRead: false,
			...(notificationIds?.length && { id: { in: notificationIds } }),
		},
		data: { isRead: true },
	});

	// Invalidate cached unread count
	await cacheDel(companyUnreadKey(companyId));

	logger.info("Company notifications marked read", {
		companyId,
		count: notificationIds?.length ?? "all",
	});
};

export const markSingleCompanyNotificationReadService = async (
	companyId: string,
	notificationId: string,
) => {
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: { companyId: true, isRead: true },
	});

	if (!notification) throw new AppError("Notification not found.", 404);
	if (notification.companyId !== companyId)
		throw new AppError("You do not have access to this notification.", 403);

	const updated = await prisma.notification.update({
		where: { id: notificationId },
		data: { isRead: true },
		select: {
			id: true,
			type: true,
			message: true,
			metadata: true,
			isRead: true,
			createdAt: true,
		},
	});

	await cacheDel(companyUnreadKey(companyId));
	logger.info("Company notification marked read (single)", {
		companyId,
		notificationId,
	});
	return updated;
};

export const deleteCompanyNotificationService = async (
	companyId: string,
	notificationId: string,
) => {
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: { companyId: true },
	});

	if (!notification) throw new AppError("Notification not found.", 404);
	if (notification.companyId !== companyId) {
		throw new AppError("You do not have access to this notification.", 403);
	}

	await prisma.notification.delete({ where: { id: notificationId } });
	await cacheDel(companyUnreadKey(companyId));

	logger.info("Company notification deleted", { companyId, notificationId });
};

// ─── User (candidate) notifications ───────────────────────────────────────────

export const listUserNotificationsService = async (
	userId: string,
	cursor?: string,
	limit = 20,
	unreadOnly = false,
) => {
	const take = Math.min(limit, 100);

	const notifications = await prisma.notification.findMany({
		where: {
			userId,
			...(unreadOnly && { isRead: false }),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			type: true,
			message: true,
			metadata: true,
			isRead: true,
			createdAt: true,
		},
	});

	const hasNextPage = notifications.length > take;
	const items = hasNextPage ? notifications.slice(0, -1) : notifications;

	return {
		notifications: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

export const getUserUnreadCountService = async (
	userId: string,
): Promise<number> => {
	const key = userUnreadKey(userId);
	const cached = await cacheGet<number>(key);
	if (cached !== null) return cached;

	const count = await prisma.notification.count({
		where: { userId, isRead: false },
	});

	void cacheSet(key, count, UNREAD_COUNT_TTL);
	return count;
};

export const markUserNotificationsReadService = async (
	userId: string,
	notificationIds?: string[],
) => {
	await prisma.notification.updateMany({
		where: {
			userId,
			isRead: false,
			...(notificationIds?.length && { id: { in: notificationIds } }),
		},
		data: { isRead: true },
	});

	await cacheDel(userUnreadKey(userId));

	logger.info("User notifications marked read", {
		userId,
		count: notificationIds?.length ?? "all",
	});
};

export const deleteUserNotificationService = async (
	userId: string,
	notificationId: string,
) => {
	const notification = await prisma.notification.findUnique({
		where: { id: notificationId },
		select: { userId: true },
	});

	if (!notification || notification.userId !== userId) {
		throw new AppError("Notification not found.", 404);
	}

	await prisma.notification.delete({ where: { id: notificationId } });
	await cacheDel(userUnreadKey(userId));

	logger.info("User notification deleted", { userId, notificationId });
};

// ─── Shared: send a user-targeted notification ─────────────────────────────────
// Called from application.service.ts when status changes affect the candidate.

export const createUserNotificationService = async (
	userId: string,
	type: string,
	message: string,
	metadata?: Record<string, unknown>,
) => {
	try {
		await prisma.notification.create({
			data: {
				// @ts-expect-error — NotificationType enum extended at DB level
				type,
				message,
				...(metadata && { metadata }),
				userId,
			},
		});
		// Invalidate cached count
		await cacheDel(userUnreadKey(userId));
	} catch (error) {
		logger.error("createUserNotification error", error);
	}
};
