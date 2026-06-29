// src/validators/company.expressValidator.ts
import { body } from "express-validator";

export const updateCompanyRules = [
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Company name must be 2–100 characters"),

	body("website")
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage("Must be a valid URL"),

	body("industry")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Industry must be 100 characters or fewer"),

	body("size")
		.optional()
		.isIn(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])
		.withMessage(
			"Size must be one of: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+",
		),
];

export const inviteTeamMemberRules = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email")
		.normalizeEmail(),

	body("role")
		.optional()
		.isIn(["RECRUITER", "CANDIDATE"])
		.withMessage("Role must be RECRUITER or CANDIDATE"),
];

export const updateTeamRoleRules = [
	body("role")
		.notEmpty()
		.withMessage("Role is required")
		.isIn(["ADMIN", "RECRUITER", "CANDIDATE"])
		.withMessage("Role must be ADMIN, RECRUITER, or CANDIDATE"),
];
