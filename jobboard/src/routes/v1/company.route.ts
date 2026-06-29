// src/routes/v1/company.route.ts
import { Router } from "express";
import {
	getCompanyAnalytics,
	getRecruiterAnalytics,
} from "@/controller/v1/company/analytics";
import { listCompanyAuditLogs } from "@/controller/v1/company/audit";
import {
	deleteCompany,
	deleteCompanyLogo,
	getCompanyProfile,
	updateCompanyProfile,
	uploadCompanyLogo,
} from "@/controller/v1/company/company";
import { listOwnershipHistory } from "@/controller/v1/company/ownershipHistory";
import {
	inviteTeamMember,
	listTeamMembers,
	removeTeamMember,
	transferTeamOwnership,
	updateTeamMemberRole,
} from "@/controller/v1/company/team";
import { imageUpload } from "@/lib/multer";
import { authMiddleware } from "@/middleware/authentication";
import {
	authorize,
	authorizeCompany,
	requireVerifiedUser,
} from "@/middleware/authorization";
import { withValidation } from "@/middleware/expressValidates";
import { validateUUID } from "@/middleware/validateUUID";
import {
	inviteTeamMemberRules,
	updateCompanyRules,
	updateTeamRoleRules,
} from "@/validators/company.expressValidator";

const router = Router();

router.use(authMiddleware);

// ─── Company profile ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /company/current:
 *   get:
 *     tags: [Companies]
 *     summary: Get own company profile
 *     description: Returns the authenticated user's associated company profile.
 *     responses:
 *       200:
 *         description: Company profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:         { type: string }
 *                     name:       { type: string }
 *                     slug:       { type: string }
 *                     email:      { type: string }
 *                     logoUrl:    { type: string, nullable: true }
 *                     website:    { type: string, nullable: true }
 *                     industry:   { type: string, nullable: true }
 *                     size:       { type: string, nullable: true }
 *                     isVerified: { type: boolean }
 *                     createdAt:  { type: string, format: date-time }
 *       404:
 *         description: No company linked to this account
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/current",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	getCompanyProfile,
);

/**
 * @openapi
 * /company/{companyId}:
 *   get:
 *     tags: [Companies]
 *     summary: Get company by ID
 *     description: Returns a specific company's public profile.
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Company profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company: { type: object }
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/:companyId",
	validateUUID("companyId"),
	authorizeCompany(["ADMIN", "RECRUITER", "CANDIDATE"]),
	getCompanyProfile,
);

/**
 * @openapi
 * /company/current:
 *   patch:
 *     tags: [Companies]
 *     summary: Update company profile
 *     description: Updates the company's profile details. Only accessible by company ADMINs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               website:  { type: string, format: uri }
 *               industry: { type: string }
 *               size:     { type: string }
 *           example:
 *             name: Acme Corp Updated
 *             industry: FinTech
 *             size: 200-500
 *     responses:
 *       200:
 *         description: Company updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 company: { type: object }
 *       403:
 *         description: Not a company admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/current",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	withValidation(updateCompanyRules),
	updateCompanyProfile,
);

/**
 * @openapi
 * /company/current:
 *   delete:
 *     tags: [Companies]
 *     summary: Delete company account
 *     description: Soft-deletes the company and all associated data. Irreversible. Company ADMIN only.
 *     responses:
 *       200:
 *         description: Company deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       403:
 *         description: Not a company admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/current",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	deleteCompany,
);

// ─── Logo ──────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /company/current/logo:
 *   post:
 *     tags: [Companies]
 *     summary: Upload company logo
 *     description: Uploads a logo image to Cloudinary. Replaces any existing logo. Company ADMIN only.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [logo]
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG/PNG), max 2MB
 *     responses:
 *       200:
 *         description: Logo uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 logoUrl: { type: string }
 *       400:
 *         description: File missing or invalid type
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/current/logo",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	imageUpload.single("logo"),
	uploadCompanyLogo,
);

/**
 * @openapi
 * /company/current/logo:
 *   delete:
 *     tags: [Companies]
 *     summary: Delete company logo
 *     description: Removes the logo from Cloudinary and clears it from the company profile. Company ADMIN only.
 *     responses:
 *       200:
 *         description: Logo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: No logo on file
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/current/logo",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	deleteCompanyLogo,
);

// ─── Team ──────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /company/current/team:
 *   get:
 *     tags: [Companies]
 *     summary: List team members
 *     description: Returns all users who belong to the current company. ADMIN and RECRUITER only.
 *     responses:
 *       200:
 *         description: Team member list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: string }
 *                       userName:  { type: string }
 *                       firstName: { type: string }
 *                       lastName:  { type: string }
 *                       email:     { type: string }
 *                       role:      { type: string }
 */
router.get("/current/team", authorize(["ADMIN", "RECRUITER"]), listTeamMembers);

/**
 * @openapi
 * /company/current/team/invite:
 *   post:
 *     tags: [Companies]
 *     summary: Invite a team member
 *     description: Sends an invitation email to a new team member. Company ADMIN only.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email: { type: string, format: email }
 *               role:  { type: string, enum: [RECRUITER, CANDIDATE] }
 *           example:
 *             email: recruiter@acme.com
 *             role: RECRUITER
 *     responses:
 *       200:
 *         description: Invitation sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       409:
 *         description: User already a team member
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/current/team/invite",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	withValidation(inviteTeamMemberRules),
	inviteTeamMember,
);

/**
 * @openapi
 * /company/current/team/{memberId}/role:
 *   patch:
 *     tags: [Companies]
 *     summary: Update team member role
 *     description: Changes a team member's role within the company. Company ADMIN only.
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [ADMIN, RECRUITER, CANDIDATE] }
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Team member not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.patch(
	"/current/team/:memberId/role",
	validateUUID("memberId"),
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	withValidation(updateTeamRoleRules),
	updateTeamMemberRole,
);

router.patch(
	"/current/team/:memberId/transfer-ownership",
	validateUUID("memberId"),
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	transferTeamOwnership,
);

/**
 * @openapi
 * /company/current/team/{memberId}:
 *   delete:
 *     tags: [Companies]
 *     summary: Remove team member
 *     description: Removes a user from the company team. Company ADMIN only.
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/current/team/:memberId",
	validateUUID("memberId"),
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	removeTeamMember,
);

// ─── Analytics ─────────────────────────────────────────────────────────────────

router.get(
	"/current/analytics",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	getCompanyAnalytics,
);

router.get(
	"/current/recruiters/:id/analytics",
	validateUUID("id"),
	authorizeCompany(["ADMIN", "RECRUITER"]),
	requireVerifiedUser,
	getRecruiterAnalytics,
);

// ─── Audit logs ────────────────────────────────────────────────────────────────

router.get(
	"/current/audit-logs",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	listCompanyAuditLogs,
);

// ─── Ownership history ──────────────────────────────────────────────────────────

router.get(
	"/current/ownership-history",
	authorizeCompany(["ADMIN"]),
	requireVerifiedUser,
	listOwnershipHistory,
);

export default router;
