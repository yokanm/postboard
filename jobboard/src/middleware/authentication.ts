// src/middleware/authentication.ts

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { type TokenType, verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/winston";
import { ErrorCodes } from "@/middleware/errorHandler";

export interface AuthRequest extends Request {
	userId?: string;
	companyId?: string | null;
	type?: TokenType;
}

const sendError = (
	res: Response,
	statusCode: number,
	code: string,
	message: string,
): void => {
	res.status(statusCode).json({ error: { code, message } });
};

export const authMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): void => {
	const authHeader = req.headers["authorization"];

	if (!authHeader?.startsWith("Bearer ")) {
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Access denied");
		return;
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Token missing");
		return;
	}

	try {
		const payload = verifyAccessToken(token);

		if (payload.type === "company") {
			req.companyId = payload.sub;
		} else {
			req.userId = payload.sub;
		}

		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			logger.warn("Access token expired", { error });
			sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Access token expired");
			return;
		}
		logger.error("Access token verification failed", { error });
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Invalid access token");
	}
};
