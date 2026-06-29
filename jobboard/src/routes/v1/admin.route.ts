// src/routes/v1/admin.route.ts
// Phase 8: Admin-only routes. Every route requires ADMIN role.
//
// ENDPOINTS:
//   GET    /admin/stats                         — platform-wide counts
//   GET    /admin/users                         — paginated user list
//   DELETE /admin/users/:userId                 — deactivate user
//   GET    /admin/companies                     — paginated company list
//   PATCH  /admin/companies/:companyId/verify   — manually verify company
//   GET    /admin/jobs                          — paginated job list
//   PATCH  /admin/jobs/:jobId/close             — force-close a job
//   DELETE /admin/jobs/:jobId                   — delete a job
//   GET    /admin/audit-logs                    — immutable audit trail

import { Router } from "express";
import {
	adminDeactivateUser,
	adminDeleteJob,
	adminForceCloseJob,
	adminListCompanies,
	adminListJobs,
	adminListUsers,
	adminVerifyCompany,
	getPlatformStats,
	listAuditLogs,
} from "@/controller/v1/admin/admin";
import { authMiddleware } from "@/middleware/authentication";
import { authorize } from "@/middleware/authorization";
import { validateUUID } from "@/middleware/validateUUID";

const router = Router();

// Every admin route requires ADMIN authentication.
router.use(authMiddleware);
router.use(authorize(["ADMIN"]));

// ─── Platform stats ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Platform statistics
 *     description: Returns platform-wide aggregate counts. ADMIN role required.
 *     responses:
 *       200:
 *         description: Platform stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:        { type: integer }
 *                     totalCompanies:    { type: integer }
 *                     totalJobs:         { type: integer }
 *                     totalApplications: { type: integer }
 *                     openJobs:          { type: integer }
 *                     pendingApplications: { type: integer }
 *       403:
 *         description: ADMIN role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/stats", getPlatformStats);

// ─── User management ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     description: Returns a paginated list of all platform users (all roles). Supports filtering by role, verification status, and search.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Pagination cursor
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, RECRUITER, CANDIDATE] }
 *       - in: query
 *         name: isVerified
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:         { type: string }
 *                       userName:   { type: string }
 *                       firstName:  { type: string }
 *                       lastName:   { type: string }
 *                       email:      { type: string }
 *                       role:       { type: string }
 *                       isVerified: { type: boolean }
 *                       createdAt:  { type: string, format: date-time }
 *                       deletedAt:  { type: string, format: date-time, nullable: true }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/users", adminListUsers);

/**
 * @openapi
 * /admin/users/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Deactivate a user
 *     description: Soft-deletes a user account by setting `deletedAt`. The user can no longer log in. This action is logged to the audit trail.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/users/:userId", validateUUID("userId"), adminDeactivateUser);

// ─── Company management ────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/companies:
 *   get:
 *     tags: [Admin]
 *     summary: List all companies
 *     description: Returns a paginated list of all companies. Supports filtering by verification status.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: isVerified
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by company name or email
 *     responses:
 *       200:
 *         description: Paginated company list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:         { type: string }
 *                       name:       { type: string }
 *                       email:      { type: string }
 *                       slug:       { type: string }
 *                       isVerified: { type: boolean }
 *                       logoUrl:    { type: string, nullable: true }
 *                       createdAt:  { type: string, format: date-time }
 *                       _count:
 *                         type: object
 *                         properties:
 *                           jobs:    { type: integer }
 *                           members: { type: integer }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/companies", adminListCompanies);

/**
 * @openapi
 * /admin/companies/{companyId}/verify:
 *   patch:
 *     tags: [Admin]
 *     summary: Toggle company verification
 *     description: |
 *       Sets or clears the `isVerified` flag for a company.
 *       Verified companies display a verification badge on their listings.
 *       This action is logged to the audit trail.
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isVerified]
 *             properties:
 *               isVerified: { type: boolean }
 *           example:
 *             isVerified: true
 *     responses:
 *       200:
 *         description: Verification status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:    { type: string }
 *                 isVerified: { type: boolean }
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/companies/:companyId/verify",
	validateUUID("companyId"),
	adminVerifyCompany,
);

// ─── Job moderation ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/jobs:
 *   get:
 *     tags: [Admin]
 *     summary: List all jobs (admin view)
 *     description: Returns all jobs across all statuses and companies. Includes jobs that are DRAFT, CLOSED, or EXPIRED.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, OPEN, CLOSED, EXPIRED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by job title
 *     responses:
 *       200:
 *         description: Paginated job list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/JobSummary' }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/jobs", adminListJobs);

/**
 * @openapi
 * /admin/jobs/{jobId}/close:
 *   patch:
 *     tags: [Admin]
 *     summary: Force-close a job
 *     description: Immediately sets a job's status to CLOSED regardless of its current state. Used for policy violations. Logged to audit trail.
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job closed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch("/jobs/:jobId/close", validateUUID("jobId"), adminForceCloseJob);

/**
 * @openapi
 * /admin/jobs/{jobId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a job (admin)
 *     description: Permanently removes a job listing and all associated applications. This action is irreversible and logged to the audit trail.
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/jobs/:jobId", validateUUID("jobId"), adminDeleteJob);

// ─── Audit log ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List audit logs
 *     description: |
 *       Returns an immutable, paginated audit trail of all admin actions (deactivations, verifications, force-closes, deletions).
 *       Logs are append-only and cannot be deleted via the API.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *         description: Filter by action type e.g. `USER_DEACTIVATED`, `COMPANY_VERIFIED`
 *       - in: query
 *         name: adminId
 *         schema: { type: string, format: uuid }
 *         description: Filter by the admin who performed the action
 *     responses:
 *       200:
 *         description: Paginated audit log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:          { type: string }
 *                       action:      { type: string, example: USER_DEACTIVATED }
 *                       targetId:    { type: string }
 *                       targetType:  { type: string, example: USER }
 *                       metadata:    { type: object, nullable: true }
 *                       createdAt:   { type: string, format: date-time }
 *                       admin:
 *                         type: object
 *                         properties:
 *                           id:       { type: string }
 *                           userName: { type: string }
 *                           email:    { type: string }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/audit-logs", listAuditLogs);

export default router;
