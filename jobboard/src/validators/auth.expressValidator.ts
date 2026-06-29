import { body } from "express-validator";

export const registerUserRules = [
	body("userName")
		.trim()
		.notEmpty()
		.withMessage("Username is required")
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be 3–30 characters")
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage("Username may only contain letters, numbers and underscores"),

	body("firstName")
		.trim()
		.notEmpty()
		.withMessage("First name is required")
		.isLength({ max: 50 })
		.withMessage("First name must be 50 characters or fewer"),

	body("lastName")
		.trim()
		.notEmpty()
		.withMessage("Last name is required")
		.isLength({ max: 50 })
		.withMessage("Last name must be 50 characters or fewer"),

	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),

	body("role")
		.optional()
		.isIn(["RECRUITER", "CANDIDATE"])
		.withMessage("Role must be RECRUITER or CANDIDATE"),

	body("phone")
		.optional({ checkFalsy: true })
		.isMobilePhone("any")
		.withMessage("Must be a valid phone number"),

	body("companyId")
		.optional({ checkFalsy: true })
		.isUUID()
		.withMessage("companyId must be a valid UUID"),
];

// ─── Login User ───────────────────────────────────────────────────────────────

export const loginUserRules = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("password").notEmpty().withMessage("Password is required"),
];

// ─── Register Company ─────────────────────────────────────────────────────────

export const registerCompanyRules = [
	body("companyName")
		.trim()
		.notEmpty()
		.withMessage("Company name is required")
		.isLength({ max: 100 })
		.withMessage("Company name must be 100 characters or fewer"),

	body("companyEmail")
		.trim()
		.notEmpty()
		.withMessage("Company email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("companyPassword")
		.notEmpty()
		.withMessage("Company password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),

	body("userName")
		.trim()
		.notEmpty()
		.withMessage("Admin username is required")
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be 3–30 characters"),

	body("firstName").trim().notEmpty().withMessage("First name is required"),

	body("lastName").trim().notEmpty().withMessage("Last name is required"),

	body("userEmail")
		.trim()
		.notEmpty()
		.withMessage("Admin email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("userPassword")
		.notEmpty()
		.withMessage("Admin password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),
];

// ─── Login Company ────────────────────────────────────────────────────────────

export const loginCompanyRules = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("password").notEmpty().withMessage("Password is required"),
];
