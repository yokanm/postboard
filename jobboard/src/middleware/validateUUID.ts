import type { NextFunction, Request, Response } from "express";
import { AppError, ErrorCodes } from "./errorHandler";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUUID(...paramNames: string[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		for (const name of paramNames) {
			const value = req.params[name];
			if (value && !UUID_RE.test(value)) {
				next(
					new AppError(
						`Invalid ${name}: must be a valid UUID`,
						400,
						ErrorCodes.VALIDATION_ERROR,
					),
				);
				return;
			}
		}
		next();
	};
}
