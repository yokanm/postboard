// src/validators/job.expressValidator.ts
import { body, query } from "express-validator";

export const createJobRules = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({ min: 3, max: 150 })
		.withMessage("Title must be 3–150 characters"),

	body("description")
		.trim()
		.notEmpty()
		.withMessage("Description is required")
		.isLength({ min: 50 })
		.withMessage("Description must be at least 50 characters"),

	body("locationType")
		.optional()
		.isIn(["REMOTE", "ONSITE", "HYBRID"])
		.withMessage("locationType must be REMOTE, ONSITE, or HYBRID"),

	body("experienceLevel")
		.optional()
		.isIn(["JUNIOR", "MID", "SENIOR", "LEAD"])
		.withMessage("experienceLevel must be JUNIOR, MID, SENIOR, or LEAD"),

	body("salaryMin")
		.optional({ checkFalsy: true })
		.isInt({ min: 0 })
		.withMessage("salaryMin must be a non-negative integer"),

	body("salaryMax")
		.optional({ checkFalsy: true })
		.isInt({ min: 0 })
		.withMessage("salaryMax must be a non-negative integer")
		.custom((max, { req }) => {
			if (req.body.salaryMin !== undefined && max < req.body.salaryMin) {
				throw new Error("salaryMax must be ≥ salaryMin");
			}
			return true;
		}),

	body("currency")
		.optional()
		.isLength({ min: 3, max: 5 })
		.withMessage("currency must be a 3–5 character code"),

	body("tags")
		.optional()
		.isArray({ max: 15 })
		.withMessage("tags must be an array of up to 15 items"),

	body("tags.*")
		.optional()
		.isString()
		.trim()
		.isLength({ min: 1, max: 50 })
		.withMessage("Each tag must be 1–50 characters"),

	body("expiresAt")
		.optional({ checkFalsy: true })
		.isISO8601()
		.withMessage("expiresAt must be a valid ISO 8601 date")
		.custom((value) => {
			if (new Date(value) <= new Date()) {
				throw new Error("expiresAt must be in the future");
			}
			return true;
		}),
];

export const updateJobRules = [
	body("title")
		.optional()
		.trim()
		.isLength({ min: 3, max: 150 })
		.withMessage("Title must be 3–150 characters"),

	body("description")
		.optional()
		.trim()
		.isLength({ min: 50 })
		.withMessage("Description must be at least 50 characters"),

	body("locationType")
		.optional()
		.isIn(["REMOTE", "ONSITE", "HYBRID"])
		.withMessage("locationType must be REMOTE, ONSITE, or HYBRID"),

	body("experienceLevel")
		.optional()
		.isIn(["JUNIOR", "MID", "SENIOR", "LEAD"])
		.withMessage("Must be JUNIOR, MID, SENIOR, or LEAD"),

	body("salaryMin")
		.optional({ checkFalsy: true })
		.isInt({ min: 0 })
		.withMessage("salaryMin must be a non-negative integer"),

	body("salaryMax")
		.optional({ checkFalsy: true })
		.isInt({ min: 0 })
		.withMessage("salaryMax must be a non-negative integer")
		.custom((max, { req }) => {
			if (req.body.salaryMin !== undefined && max < req.body.salaryMin) {
				throw new Error("salaryMax must be ≥ salaryMin");
			}
			return true;
		}),
	body("tags")
		.optional()
		.isArray({ max: 15 })
		.withMessage("tags must be an array of up to 15 items"),

	body("expiresAt")
		.optional({ checkFalsy: true })
		.isISO8601()
		.withMessage("expiresAt must be a valid ISO 8601 date"),
];

export const updateJobStatusRules = [
	body("status")
		.notEmpty()
		.withMessage("status is required")
		.isIn(["OPEN", "CLOSED"])
		.withMessage("status must be OPEN or CLOSED"),
];

export const listJobsQueryRules = [
	query("status")
		.optional()
		.isIn(["DRAFT", "OPEN", "CLOSED", "EXPIRED"])
		.withMessage("Invalid status filter"),

	query("locationType")
		.optional()
		.isIn(["REMOTE", "ONSITE", "HYBRID"])
		.withMessage("Invalid locationType filter"),

	query("experienceLevel")
		.optional()
		.isIn(["JUNIOR", "MID", "SENIOR", "LEAD"])
		.withMessage("Invalid experienceLevel filter"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("limit must be between 1 and 100"),

	query("cursor")
		.optional({ checkFalsy: true })
		.isString()
		.withMessage("cursor must be a string"),
];
