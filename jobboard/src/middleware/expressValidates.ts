import type { NextFunction, Request, Response } from "express";
import { type ValidationChain, validationResult } from "express-validator";

// ─── Middleware ───────────────────────────────────────────────────────────────

export const validate = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "Validation failed",
				details: errors.array().map((error) => ({
					field: error.type === "field" ? error.path : "unknown",
					message: error.msg as string,
				})),
			},
		});
		return;
	}

	next();
};

// ─── Helper: wrap chains + validate into a single array ──────────────────────
// Lets you do:  router.post('/register', withValidation(registerUserRules), handler)

export const withValidation = (chains: ValidationChain[]) => [
	...chains,
	validate,
];
