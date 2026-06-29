import type { NextFunction, Response } from "express";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";

export type AuthRoles = "ADMIN" | "RECRUITER" | "CANDIDATE";

const sendError = (
	res: Response,
	statusCode: number,
	code: string,
	message: string,
): void => {
	res.status(statusCode).json({ error: { code, message } });
};

export const requireVerifiedUser = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.userId) {
			sendError(res, 403, ErrorCodes.FORBIDDEN, "User token required");
			return;
		}
		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			select: { id: true, isVerified: true, deletedAt: true },
		});

		if (!user || user.deletedAt) {
			sendError(
				res,
				401,
				ErrorCodes.UNAUTHORIZED,
				"Account not found or deactivated.",
			);
			return;
		}

		if (!user.isVerified) {
			sendError(
				res,
				403,
				ErrorCodes.FORBIDDEN,
				"Email verification required to perform this action.",
			);
			return;
		}

		next();
	} catch (error) {
		logger.error("requireVerifiedUser error", error);
		sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
	}
};

export const authorize = (roles: AuthRoles[]) => {
	return async (req: AuthRequest, res: Response, next: NextFunction) => {
		const userId = req.userId;

		if (!userId) {
			sendError(res, 403, ErrorCodes.FORBIDDEN, "User token required");
			return;
		}

		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					role: true,
					companyId: true,
					isVerified: true,
					deletedAt: true,
				},
			});

			if (!user || user.deletedAt) {
				sendError(
					res,
					401,
					ErrorCodes.UNAUTHORIZED,
					"User account not found or has been deactivated.",
				);
				return;
			}

			if (!user.isVerified) {
				sendError(
					res,
					403,
					ErrorCodes.FORBIDDEN,
					"Email verification required to access this resource.",
				);
				return;
			}

			if (!roles.includes(user.role as AuthRoles)) {
				sendError(
					res,
					403,
					ErrorCodes.FORBIDDEN,
					"You do not have permission to access this resource.",
				);
				return;
			}

			req.companyId = user.companyId ?? undefined;
			next();
		} catch (error) {
			logger.error("Authorize error", error);
			sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
		}
	};
};

/**
 * Lightweight guard that just checks the user is not soft-deleted.
 * Useful when any authenticated user may proceed regardless of role.
 */
export const requireActiveUser = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.userId },
			select: { companyId: true, deletedAt: true },
		});

		if (!user || user.deletedAt) {
			sendError(
				res,
				401,
				ErrorCodes.UNAUTHORIZED,
				"Account not found or deactivated.",
			);
			return;
		}

		req.companyId = user.companyId ?? undefined;
		next();
	} catch (error) {
		logger.error("requireActiveUser error", error);
		sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
	}
};

/** Company-scoped guard
 * companyId is read from the JWT payload (set by authMiddleware) — no extra DB
 * lookup needed. Role is re-validated against DB to handle mid-session changes.
 */
export const authorizeCompany = (roles: AuthRoles[]) => {
	return async (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.userId) {
			sendError(res, 403, ErrorCodes.FORBIDDEN, "User token required");
			return;
		}
		try {
			const user = await prisma.user.findUnique({
				where: { id: req.userId },
				select: {
					id: true,
					role: true,
					companyId: true,
					isVerified: true,
					deletedAt: true,
				},
			});

			if (!user || user.deletedAt) {
				sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Unauthorized");
				return;
			}

			if (!user.isVerified) {
				sendError(
					res,
					403,
					ErrorCodes.FORBIDDEN,
					"Email verification required to access this resource.",
				);
				return;
			}

			if (!user.companyId) {
				sendError(
					res,
					403,
					ErrorCodes.FORBIDDEN,
					"You are not associated with a company.",
				);
				return;
			}

			const targetCompanyId = req.params.companyId ?? user.companyId;

			if (targetCompanyId && user.companyId !== targetCompanyId) {
				sendError(res, 403, ErrorCodes.FORBIDDEN, "Forbidden");
				return;
			}

			if (!roles.includes(user.role as AuthRoles)) {
				sendError(res, 403, ErrorCodes.FORBIDDEN, "Forbidden");
				return;
			}

			req.companyId = user.companyId ?? undefined;
			next();
		} catch (error) {
			logger.error("authorizeCompany error", error);
			sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
			return;
		}
	};
};
