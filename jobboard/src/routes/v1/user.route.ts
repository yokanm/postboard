// src/routes/v1/user.route.ts

import { Router } from "express";
import {
	deleteUserAccount,
	getCurrentUser,
	updateUser,
} from "@/controller/v1/user/currentUser";
import {
	deleteResume,
	getProfile,
	uploadResume,
	upsertProfile,
} from "@/controller/v1/user/profile";
import { resumeUpload } from "@/lib/multer";
import { authMiddleware } from "@/middleware/authentication";
import { authorize } from "@/middleware/authorization";
import { withValidation } from "@/middleware/expressValidates";
import {
	deleteAccountRules,
	updateUserRules,
	upsertProfileRules,
} from "@/validators/user.expressValidator";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /user/current:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     description: Returns the authenticated user's account details.
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:         { type: string }
 *                     userName:   { type: string }
 *                     firstName:  { type: string }
 *                     lastName:   { type: string }
 *                     email:      { type: string }
 *                     role:       { type: string, enum: [ADMIN, RECRUITER, CANDIDATE] }
 *                     isVerified: { type: boolean }
 *                     phone:      { type: string, nullable: true }
 *                     createdAt:  { type: string, format: date-time }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/current",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	getCurrentUser,
);

/**
 * @openapi
 * /user/current:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user
 *     description: Updates firstName, lastName, userName, or phone for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               userName:  { type: string }
 *               phone:     { type: string }
 *           example:
 *             firstName: Jane
 *             lastName: Smith
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:    { type: object }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 */
router.patch(
	"/current",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	withValidation(updateUserRules),
	updateUser,
);

/**
 * @openapi
 * /user/current:
 *   delete:
 *     tags: [Users]
 *     summary: Delete own account
 *     description: Soft-deletes the authenticated user's account. Requires password confirmation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, description: Current password for confirmation }
 *     responses:
 *       200:
 *         description: Account deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401:
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/current",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	withValidation(deleteAccountRules),
	deleteUserAccount,
);

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /user/current/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     description: Returns the authenticated user's extended profile including skills, bio, resume, and social links.
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:          { type: string }
 *                     bio:         { type: string, nullable: true }
 *                     resumeUrl:   { type: string, nullable: true }
 *                     linkedinUrl: { type: string, nullable: true }
 *                     githubUrl:   { type: string, nullable: true }
 *                     skills:      { type: array, items: { type: string } }
 *                     location:    { type: string, nullable: true }
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
	"/current/profile",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	getProfile,
);

/**
 * @openapi
 * /user/current/profile:
 *   put:
 *     tags: [Users]
 *     summary: Create or update user profile
 *     description: Upserts the full profile record. All fields are optional — only provided fields are updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:         { type: string, maxLength: 1000 }
 *               linkedinUrl: { type: string, format: uri }
 *               githubUrl:   { type: string, format: uri }
 *               skills:      { type: array, items: { type: string }, maxItems: 30 }
 *               location:    { type: string }
 *           example:
 *             bio: Full-stack developer with 5 years experience
 *             skills: [TypeScript, Node.js, PostgreSQL]
 *             location: Lagos, Nigeria
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 profile: { type: object }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 */
router.put(
	"/current/profile",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	withValidation(upsertProfileRules),
	upsertProfile,
);

/**
 * @openapi
 * /user/current/profile/resume:
 *   post:
 *     tags: [Users]
 *     summary: Upload resume (PDF)
 *     description: Uploads a PDF resume to Cloudinary and stores the URL in the user profile. Replaces any existing resume.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [resume]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF file, max 5MB
 *     responses:
 *       200:
 *         description: Resume uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:   { type: string }
 *                 resumeUrl: { type: string }
 *       400:
 *         description: File missing or not a PDF
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/current/profile/resume",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	resumeUpload.single("resume"),
	uploadResume,
);

/**
 * @openapi
 * /user/current/profile/resume:
 *   delete:
 *     tags: [Users]
 *     summary: Delete resume
 *     description: Removes the resume from Cloudinary and clears the URL from the user profile.
 *     responses:
 *       200:
 *         description: Resume deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: No resume on file
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete(
	"/current/profile/resume",
	authorize(["ADMIN", "RECRUITER", "CANDIDATE"]),
	deleteResume,
);

export default router;
