// src/validators/user.expressValidator.ts
import { body } from "express-validator";

export const updateUserRules = [
	body("firstName")
		.optional()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("First name must be 1–50 characters"),

	body("lastName")
		.optional()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Last name must be 1–50 characters"),

	body("userName")
		.optional()
		.trim()
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be 3–30 characters")
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage("Username may only contain letters, numbers and underscores"),

	body("phone")
		.optional({ checkFalsy: true })
		.isMobilePhone("any")
		.withMessage("Must be a valid phone number"),
];

export const upsertProfileRules = [
	body("bio")
		.optional()
		.isLength({ max: 1000 })
		.withMessage("Bio must be 1000 characters or fewer"),

	body("linkedinUrl")
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage("Must be a valid URL"),

	body("githubUrl")
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage("Must be a valid URL"),

	body("skills").optional().isArray().withMessage("Skills must be an array"),

	body("skills.*")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Each skill must be 1–50 characters"),

	body("location")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Location must be 100 characters or fewer"),
];

export const changePasswordRules = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required"),

	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number")
		.custom((value, { req }) => {
			if (value === req.body.currentPassword) {
				throw new Error("New password must differ from current password");
			}
			return true;
		}),
];

export const deleteAccountRules = [
	body("password").notEmpty().withMessage("Password is required"),
];
