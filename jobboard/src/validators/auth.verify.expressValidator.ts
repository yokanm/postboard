// src/validators/auth.verify.expressValidator.ts
import { body } from "express-validator";

export const emailRules = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email")
		.normalizeEmail(),
];

export const resetPasswordRules = [
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),
];
