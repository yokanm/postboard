// src/routes/v1/notification.route.ts
import { Router } from "express";
import {
	deleteCompanyNotification,
	deleteUserNotification,
	getCompanyUnreadCount,
	getUserUnreadCount,
	listCompanyNotifications,
	listUserNotifications,
	markCompanyNotificationsRead,
	markSingleCompanyNotificationRead,
	markUserNotificationsRead,
} from "@/controller/v1/notifications/notification";
import { authMiddleware } from "@/middleware/authentication";
import { authorize, authorizeCompany } from "@/middleware/authorization";
import { validateUUID } from "@/middleware/validateUUID";

const router = Router();

router.use(authMiddleware);

// ─── Company notifications ─────────────────────────────────────────────────────

/**
 * @openapi
 * /notifications/company:
 *   get:
 *     tags: [Notifications]
 *     summary: List company notifications
 *     description: Returns paginated notifications for the authenticated company. ADMIN or RECRUITER role required. Results are cached in Redis for 30 seconds.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Pagination cursor from previous response
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *         description: Filter to unread notifications only
 *     responses:
 *       200:
 *         description: Paginated notification list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get(
	"/company",
	authorizeCompany(["ADMIN", "RECRUITER"]),
	listCompanyNotifications,
);

/**
 * @openapi
 * /notifications/company/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get company unread notification count
 *     description: Returns the number of unread notifications. Result is cached in Redis for 60 seconds.
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 5 }
 */
router.get(
	"/company/unread-count",
	authorizeCompany(["ADMIN", "RECRUITER"]),
	getCompanyUnreadCount,
);

/**
 * @openapi
 * /notifications/company/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark company notifications as read
 *     description: Marks one, many, or all company notifications as read. Pass an array of IDs to mark specific ones, or omit to mark all.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *                 description: Notification IDs to mark read. Omit to mark all.
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updated: { type: integer }
 */
router.patch(
	"/company/read",
	authorizeCompany(["ADMIN", "RECRUITER"]),
	markCompanyNotificationsRead,
);

/**
 * @openapi
 * /notifications/company/{notificationId}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark single company notification as read
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/company/:notificationId/read",
	validateUUID("notificationId"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	markSingleCompanyNotificationRead,
);

/**
 * @openapi
 * /notifications/company/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a company notification
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/company/:notificationId",
	validateUUID("notificationId"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	deleteCompanyNotification,
);

// ─── User (candidate) notifications ───────────────────────────────────────────

/**
 * @openapi
 * /notifications/user:
 *   get:
 *     tags: [Notifications]
 *     summary: List user notifications
 *     description: Returns paginated notifications for the authenticated candidate.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated notification list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/user", authorize(["CANDIDATE"]), listUserNotifications);

/**
 * @openapi
 * /notifications/user/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user unread notification count
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */
router.get("/user/unread-count", authorize(["CANDIDATE"]), getUserUnreadCount);

/**
 * @openapi
 * /notifications/user/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark user notifications as read
 *     description: Marks one, many, or all user notifications as read. Omit `ids` to mark all.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updated: { type: integer }
 */
router.patch("/user/read", authorize(["CANDIDATE"]), markUserNotificationsRead);

/**
 * @openapi
 * /notifications/user/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a user notification
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notification deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/user/:notificationId",
	validateUUID("notificationId"),
	authorize(["CANDIDATE"]),
	deleteUserNotification,
);

export default router;
