import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
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

export const listCompanyNotifications = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"Company context required.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const { cursor, limit, unreadOnly } = req.query as {
			cursor?: string;
			limit?: string;
			unreadOnly?: string;
		};

		const result = await listCompanyNotificationsService(
			req.companyId,
			cursor,
			limit ? parseInt(limit, 10) : 20,
			unreadOnly === "true",
		);

		sendPaginated(res, result.notifications, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const getCompanyUnreadCount = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"Company context required.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const count = await getCompanyUnreadCountService(req.companyId);
		sendSuccess(res, { count });
	},
);

export const markCompanyNotificationsRead = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"Company context required.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const ids: string[] | undefined = req.body.ids;
		await markCompanyNotificationsReadService(req.companyId, ids);
		sendMessage(res, "Notifications marked as read.");
	},
);

export const deleteCompanyNotification = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"Company context required.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		await deleteCompanyNotificationService(
			req.companyId,
			req.params["notificationId"] as string,
		);

		sendMessage(res, "Notification deleted.");
	},
);

export const markSingleCompanyNotificationRead = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"Company context required.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const notification = await markSingleCompanyNotificationReadService(
			req.companyId,
			req.params["notificationId"] as string,
		);

		sendSuccess(res, { notification });
	},
);

export const listUserNotifications = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.userId) {
			throw new AppError(
				"Authentication required.",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		const { cursor, limit, unreadOnly } = req.query as {
			cursor?: string;
			limit?: string;
			unreadOnly?: string;
		};

		const result = await listUserNotificationsService(
			req.userId,
			cursor,
			limit ? parseInt(limit, 10) : 20,
			unreadOnly === "true",
		);

		sendPaginated(res, result.notifications, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const getUserUnreadCount = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.userId) {
			throw new AppError(
				"Authentication required.",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		const count = await getUserUnreadCountService(req.userId);
		sendSuccess(res, { unreadCount: count });
	},
);

export const markUserNotificationsRead = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.userId) {
			throw new AppError(
				"Authentication required.",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		const ids: string[] | undefined = req.body.ids;
		await markUserNotificationsReadService(req.userId, ids);
		sendMessage(res, "Notifications marked as read.");
	},
);

export const deleteUserNotification = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.userId) {
			throw new AppError(
				"Authentication required.",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		await deleteUserNotificationService(
			req.userId,
			req.params["notificationId"] as string,
		);

		sendMessage(res, "Notification deleted.");
	},
);
