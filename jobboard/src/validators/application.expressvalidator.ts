// src/validators/application.expressValidator.ts
import { body } from "express-validator";

export const applyToJobRules = [
	body("coverLetter")
		.optional()
		.isString()
		.isLength({ max: 3000 })
		.withMessage("Cover letter must be 3000 characters or fewer"),

	body("resumeUrl")
		.optional({ checkFalsy: true })
		.isURL()
		.withMessage("resumeUrl must be a valid URL"),
];

export const updateApplicationStatusRules = [
	body("status")
		.notEmpty()
		.withMessage("status is required")
		.isIn(["REVIEWED", "SHORTLISTED", "ACCEPTED", "REJECTED"])
		.withMessage("status must be REVIEWED, SHORTLISTED, ACCEPTED, or REJECTED"),

	body("rejectionReason")
		.optional()
		.isString()
		.isLength({ max: 1000 })
		.withMessage("Rejection reason must be 1000 characters or fewer"),
];
