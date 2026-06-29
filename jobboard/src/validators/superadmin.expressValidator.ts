// src/validators/superadmin.expressValidator.ts
//
// Validation rules for super admin endpoints.
// Follows the exact same pattern as auth.expressValidator.ts in this codebase.

import { body } from "express-validator";

// ─── SuperAdmin Login ─────────────────────────────────────────────────────────

export const loginSuperAdminRules = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("password").notEmpty().withMessage("Password is required"),
];

// ─── Verify Company ───────────────────────────────────────────────────────────

export const verifyCompanyRules = [
	body("isVerified").isBoolean().withMessage("isVerified must be a boolean"),
];
