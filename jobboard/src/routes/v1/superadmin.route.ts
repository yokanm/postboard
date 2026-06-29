// src/routes/v1/superadmin.route.ts
//
// All routes are prefixed /api/v1/superadmin by the root router (routes/v1/index.ts).
//
// Public:
//   POST /superadmin/login
//   POST /superadmin/refresh   — rotates SuperAdmin refresh token (cookie)
//
// Protected (superAdminAuth middleware):
//   POST   /superadmin/logout
//   GET    /superadmin/stats
//   GET    /superadmin/companies
//   PATCH  /superadmin/companies/:id/verify
//   DELETE /superadmin/companies/:id
//   GET    /superadmin/jobs
//   DELETE /superadmin/jobs/:id/force-close
//   GET    /superadmin/candidates
//   DELETE /superadmin/candidates/:id/ban

import { Router } from "express";
import {
	assignCompanyOwner,
	listOwnerlessCompanies,
	recoverOwnerlessCompany,
} from "@/controller/v1/superadmin/recovery";
import { listSecurityEvents } from "@/controller/v1/superadmin/securityEvents";
import {
	banCandidate,
	deleteCompany,
	forceCloseJob,
	getPlatformStats,
	listAllCandidates,
	listAllCompanies,
	listAllJobs,
	loginSuperAdmin,
	logoutSuperAdmin,
	refreshSuperAdminToken,
	setCompanyVerification,
} from "@/controller/v1/superadmin/superadmin";
import { authLimiter } from "@/lib/express_rate_limit";
import { withValidation } from "@/middleware/expressValidates";
import { superAdminAuth } from "@/middleware/superAdminAuth";
import { validateUUID } from "@/middleware/validateUUID";
import {
	loginSuperAdminRules,
	verifyCompanyRules,
} from "@/validators/superadmin.expressValidator";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /superadmin/login:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: SuperAdmin login
 *     description: |
 *       Authenticates a SuperAdmin and returns a signed access token.
 *       A refresh token is set as an httpOnly `superAdminRefreshToken` cookie.
 *       Rate limited to 10 requests per 15 minutes per IP.
 *       SuperAdmin tokens are signed with a separate secret (`JWT_SUPERADMIN_SECRET`)
 *       and carry `type: superadmin` in their payload.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *           example:
 *             email: superadmin@yourdomain.com
 *             password: SuperSecret123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 accessToken: { type: string }
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:        { type: string }
 *                     email:     { type: string }
 *                     firstName: { type: string }
 *                     lastName:  { type: string }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Too many attempts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/login",
	authLimiter,
	...withValidation(loginSuperAdminRules),
	loginSuperAdmin,
);

/**
 * @openapi
 * /superadmin/refresh:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: Refresh SuperAdmin access token
 *     description: |
 *       Rotates the SuperAdmin refresh token (httpOnly cookie) and issues a new access token.
 *       The old refresh token hash is immediately revoked.
 *       Send this request with credentials (cookie) — no body required.
 *     security: []
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *       401:
 *         description: Refresh token missing, invalid, expired, or revoked
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/refresh", authLimiter, refreshSuperAdminToken);

// ─── Protected — all routes below require a valid SuperAdmin JWT ──────────────
router.use(superAdminAuth);

/**
 * @openapi
 * /superadmin/logout:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: SuperAdmin logout
 *     description: Revokes the SuperAdmin refresh token hash and clears the httpOnly cookie.
 *     responses:
 *       204:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/logout", logoutSuperAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /superadmin/stats:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Full platform statistics
 *     description: Returns comprehensive platform-wide counts including deleted/banned records not visible to regular admins.
 *     responses:
 *       200:
 *         description: Full platform stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:            { type: integer }
 *                     activeUsers:           { type: integer }
 *                     deactivatedUsers:      { type: integer }
 *                     totalCompanies:        { type: integer }
 *                     verifiedCompanies:     { type: integer }
 *                     totalJobs:             { type: integer }
 *                     openJobs:              { type: integer }
 *                     totalApplications:     { type: integer }
 *                     pendingApplications:   { type: integer }
 */
router.get("/stats", getPlatformStats);

// ─── Company management ────────────────────────────────────────────────────────

/**
 * @openapi
 * /superadmin/companies:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: List all companies (superadmin view)
 *     description: Returns all companies including soft-deleted ones. SuperAdmin only.
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
 *         name: includeDeleted
 *         schema: { type: boolean }
 *         description: Include soft-deleted companies
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
 *                   items: { type: object }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/companies", listAllCompanies);

/**
 * @openapi
 * /superadmin/companies/{id}/verify:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Set company verification status
 *     description: Sets or clears the `isVerified` flag. SuperAdmin-level verification overrides admin actions.
 *     parameters:
 *       - in: path
 *         name: id
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
 *     responses:
 *       200:
 *         description: Verification updated
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
	"/companies/:id/verify",
	validateUUID("id"),
	...withValidation(verifyCompanyRules),
	setCompanyVerification,
);

/**
 * @openapi
 * /superadmin/companies/{id}:
 *   delete:
 *     tags: [SuperAdmin]
 *     summary: Permanently delete a company
 *     description: Hard-deletes a company and cascades to all associated jobs, applications, and team memberships. Irreversible. SuperAdmin only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Company permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/companies/:id", validateUUID("id"), deleteCompany);

// ─── Job moderation ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /superadmin/jobs:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: List all jobs (superadmin view)
 *     description: Returns every job across all statuses including force-closed ones.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, OPEN, CLOSED, EXPIRED] }
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
router.get("/jobs", listAllJobs);

/**
 * @openapi
 * /superadmin/jobs/{id}/force-close:
 *   delete:
 *     tags: [SuperAdmin]
 *     summary: Force-close a job
 *     description: Immediately sets job status to CLOSED. Used for TOS violations. SuperAdmin only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job force-closed
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
router.delete("/jobs/:id/force-close", validateUUID("id"), forceCloseJob);

// ─── Candidate management ──────────────────────────────────────────────────────

/**
 * @openapi
 * /superadmin/candidates:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: List all candidates
 *     description: Returns all users with the CANDIDATE role including banned/deactivated accounts.
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: includeBanned
 *         schema: { type: boolean }
 *         description: Include soft-deleted (banned) candidates
 *     responses:
 *       200:
 *         description: Paginated candidate list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 candidates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:         { type: string }
 *                       userName:   { type: string }
 *                       email:      { type: string }
 *                       isVerified: { type: boolean }
 *                       deletedAt:  { type: string, format: date-time, nullable: true }
 *                       createdAt:  { type: string, format: date-time }
 *                       _count:
 *                         type: object
 *                         properties:
 *                           applications: { type: integer }
 *                 meta: { $ref: '#/components/schemas/PaginatedMeta' }
 */
router.get("/candidates", listAllCandidates);

/**
 * @openapi
 * /superadmin/candidates/{id}/ban:
 *   delete:
 *     tags: [SuperAdmin]
 *     summary: Ban a candidate
 *     description: |
 *       Soft-deletes a candidate account by setting `deletedAt`.
 *       The candidate can no longer log in or apply to jobs.
 *       All pending applications are not automatically withdrawn.
 *       SuperAdmin only.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Candidate banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Target user is not a CANDIDATE
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Candidate not found or already deactivated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/candidates/:id/ban", validateUUID("id"), banCandidate);

// ─── Security monitoring ───────────────────────────────────────────────────────

router.get("/security-events", listSecurityEvents);

// ─── Ownership recovery ────────────────────────────────────────────────────────

router.get("/ownerless-companies", listOwnerlessCompanies);
router.post(
	"/companies/:id/assign-owner",
	validateUUID("id"),
	assignCompanyOwner,
);
router.post(
	"/companies/:id/recover-ownership",
	validateUUID("id"),
	recoverOwnerlessCompany,
);

export default router;
