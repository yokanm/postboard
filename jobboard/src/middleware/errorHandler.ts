// src/middleware/errorHandler.ts

import type { NextFunction, Request, Response } from "express";
import config from "@/config";
import logger from "@/lib/winston";

// ─── Error codes ──────────────────────────────────────────────────────────────

export const ErrorCodes = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	RATE_LIMITED: "RATE_LIMITED",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	GONE: "GONE",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ─── AppError ─────────────────────────────────────────────────────────────────
// Throw this in any controller to send a specific status + machine-readable code.

export class AppError extends Error {
	constructor(
		public message: string,
		public statusCode: number = 500,
		public code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
	) {
		super(message);
		this.name = "AppError";
	}
}

// ─── 404 ──────────────────────────────────────────────────────────────────────

export const notFound = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	next(
		new AppError(
			`Cannot ${req.method} ${req.originalUrl}`,
			404,
			ErrorCodes.NOT_FOUND,
		),
	);
};

// ─── Global error handler ─────────────────────────────────────────────────────

export const errorHandler = (
	err: AppError | Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	const statusCode = err instanceof AppError ? err.statusCode : 500;
	const code = err instanceof AppError ? err.code : ErrorCodes.INTERNAL_ERROR;
	const message =
		err instanceof AppError ? err.message : "Internal server error";

	logger.error(err.message, { statusCode, code, stack: err.stack });

	res.status(statusCode).json({
		error: {
			code,
			message,
			...(config.NODE_ENV !== "production" && { stack: err.stack }),
		},
	});
};
