// src/routes/v1/auth.route.ts
import { Router } from "express";
import {
	sendCompanyVerificationEmail,
	sendUserVerificationEmail,
	verifyCompanyEmail,
	verifyUserEmail,
} from "@/controller/v1/auth/emailVerification";
import { loginCompany, loginUser } from "@/controller/v1/auth/login";
import { logout } from "@/controller/v1/auth/logout";
import {
	changeUserPassword,
	forgotCompanyPassword,
	forgotUserPassword,
	resetCompanyPassword,
	resetUserPassword,
} from "@/controller/v1/auth/passwordReset";
import refreshToken from "@/controller/v1/auth/refreshToken";
import { registerCompany, registerUsers } from "@/controller/v1/auth/register";
import { authLimiter } from "@/lib/express_rate_limit";
import { authMiddleware } from "@/middleware/authentication";
import { withValidation } from "@/middleware/expressValidates";
import {
	loginCompanyRules,
	loginUserRules,
	registerCompanyRules,
	registerUserRules,
} from "@/validators/auth.expressValidator";
import {
	emailRules,
	resetPasswordRules,
} from "@/validators/auth.verify.expressValidator";
import { changePasswordRules } from "@/validators/user.expressValidator";

const router = Router();

// ─── User auth ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account. Role defaults to CANDIDATE. A verification email is sent after registration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *           example:
 *             userName: johndoe
 *             firstName: John
 *             lastName: Doe
 *             email: john@example.com
 *             password: Secret123!
 *             role: CANDIDATE
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please check your email to verify your account.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:       { type: string }
 *                     userName: { type: string }
 *                     email:    { type: string }
 *                     role:     { type: string }
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 */
router.post(
	"/register",
	authLimiter,
	withValidation(registerUserRules),
	registerUsers,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login as a user
 *     description: Authenticates a user and returns an access token. A refresh token is set as an httpOnly cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *           example:
 *             email: john@example.com
 *             password: Secret123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginUserResponse' }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/login", authLimiter, withValidation(loginUserRules), loginUser);

// ─── Company auth ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/register/company:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new company
 *     description: Creates a new company account. A verification email is sent after registration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: Acme Corp }
 *               email:    { type: string, format: email, example: hiring@acme.com }
 *               password: { type: string, minLength: 8, example: Secret123! }
 *               website:  { type: string, example: https://acme.com }
 *               industry: { type: string, example: Technology }
 *               size:     { type: string, example: '50-200' }
 *     responses:
 *       201:
 *         description: Company registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:    { type: string }
 *                     name:  { type: string }
 *                     email: { type: string }
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 */
router.post(
	"/register/company",
	authLimiter,
	withValidation(registerCompanyRules),
	registerCompany,
);

/**
 * @openapi
 * /auth/login/company:
 *   post:
 *     tags: [Auth]
 *     summary: Login as a company
 *     description: Authenticates a company account. Returns access token; refresh token is set as an httpOnly cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *           example:
 *             email: hiring@acme.com
 *             password: Secret123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 company:
 *                   type: object
 *                   properties:
 *                     id:    { type: string }
 *                     name:  { type: string }
 *                     email: { type: string }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/login/company",
	authLimiter,
	withValidation(loginCompanyRules),
	loginCompany,
);

// ─── Token management ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: |
 *       Rotates the refresh token and issues a new access token.
 *       Pass the refresh token in the request body OR as the `refreshToken` httpOnly cookie.
 *       The old refresh token is immediately revoked (token rotation).
 *     security: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: Raw refresh JWT (alternative to cookie) }
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:  { type: string }
 *                 refreshToken: { type: string }
 *       401:
 *         description: Refresh token missing, invalid, expired, or already revoked
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/refresh-token", refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     description: Revokes the refresh token stored in the httpOnly cookie and clears it. The access token expires on its own (15 min TTL).
 *     responses:
 *       204:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/logout", authMiddleware, logout);

// ─── Email verification (user) ────────────────────────────────────────────────

/**
 * @openapi
 * /auth/send-verification-email:
 *   post:
 *     tags: [Auth]
 *     summary: Send user email verification
 *     description: Sends a verification link to the provided email address. Rate limited.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/send-verification-email",
	authLimiter,
	withValidation(emailRules),
	sendUserVerificationEmail,
);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify user email address
 *     description: Consumes a one-time verification token from the email link.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: The verification token from the email link
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/verify-email", verifyUserEmail);

// ─── Email verification (company) ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/company/send-verification-email:
 *   post:
 *     tags: [Auth]
 *     summary: Send company email verification
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Verification email sent
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
router.post(
	"/company/send-verification-email",
	authLimiter,
	withValidation(emailRules),
	sendCompanyVerificationEmail,
);

/**
 * @openapi
 * /auth/company/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify company email address
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/company/verify-email", verifyCompanyEmail);

// ─── Password reset (user) ────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request user password reset
 *     description: Sends a password-reset link to the provided email. Always returns 200 to prevent email enumeration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent (always returned, even if email not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post(
	"/forgot-password",
	authLimiter,
	withValidation(emailRules),
	forgotUserPassword,
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset user password
 *     description: Consumes the one-time reset token and sets a new password.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: The reset token from the email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 8, example: NewSecret123! }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/reset-password",
	authLimiter,
	withValidation(resetPasswordRules),
	resetUserPassword,
);

// ─── Password reset (company) ─────────────────────────────────────────────────

/**
 * @openapi
 * /auth/company/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request company password reset
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post(
	"/company/forgot-password",
	authLimiter,
	withValidation(emailRules),
	forgotCompanyPassword,
);

/**
 * @openapi
 * /auth/company/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset company password
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/company/reset-password",
	authLimiter,
	withValidation(resetPasswordRules),
	resetCompanyPassword,
);

// ─── Change password (authenticated user) ────────────────────────────────────

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (authenticated)
 *     description: Allows a logged-in user to change their password by providing their current password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401:
 *         description: Current password incorrect
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post(
	"/change-password",
	authMiddleware,
	authLimiter,
	withValidation(changePasswordRules),
	changeUserPassword,
);

export default router;
