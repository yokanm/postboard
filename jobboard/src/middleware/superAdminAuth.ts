// src/middleware/superAdminAuth.ts
//
// Guards all /api/v1/superadmin/* routes (except /login).
//
// Why a separate middleware instead of reusing authMiddleware + authorize?
//   1. SuperAdmin lives in a different Prisma model (SuperAdmin, not User).
//   2. We do a DB lookup to confirm the token sub is actually a SuperAdmin —
//      this prevents a regular User JWT from working even if the role claim
//      were somehow forged or misconfigured.
//   3. Keeps the SuperAdmin surface completely isolated from the User auth path.

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifySuperAdminToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { ErrorCodes } from "@/middleware/errorHandler";

// Extend Request so downstream handlers can read superAdminId without casting
export interface SuperAdminRequest extends Request {
	superAdminId?: string;
}

const sendError = (
	res: Response,
	statusCode: number,
	code: string,
	message: string,
): void => {
	res.status(statusCode).json({ error: { code, message } });
};

export const superAdminAuth = async (
	req: SuperAdminRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers["authorization"];

	if (!authHeader?.startsWith("Bearer ")) {
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Bearer token required");
		return;
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Token missing");
		return;
	}

	try {
		const payload = verifySuperAdminToken(token);

		if (payload.type !== "superadmin") {
			sendError(res, 403, ErrorCodes.FORBIDDEN, "Invalid token type");
			return;
		}

		const admin = await prisma.superAdmin.findUnique({
			where: { id: payload.sub },
			select: { id: true },
		});

		if (!admin) {
			sendError(
				res,
				403,
				ErrorCodes.FORBIDDEN,
				"Token does not belong to a super admin account",
			);
			return;
		}

		req.superAdminId = admin.id;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Token expired");
			return;
		}
		logger.error("superAdminAuth error", error);
		sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Invalid super admin token");
	}
};
