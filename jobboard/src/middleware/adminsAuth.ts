// src/middleware/adminOrSuperAdminAuth.ts
//
// Guards routes that must be accessible only by platform administrators:
//   • Regular users with role = ADMIN  (verified via JWT_ACCESS_SECRET)
//   • SuperAdmins                      (verified via JWT_SUPERADMIN_SECRET)
//
// Used by:
//   • /admin/queues   — Bull Board dashboard
//   • /api/v1/docs    — Swagger UI
//
// STRATEGY:
//   Both token types use different signing secrets, so we can safely attempt
//   each verification in sequence without ambiguity:
//
//   1. Try verifyAccessToken (JWT_ACCESS_SECRET).
//      • Success + role = ADMIN  → allow.
//      • Success + other role    → 403 (valid token, wrong role — stop here).
//      • TokenExpiredError       → 401 (it WAS a user token, just expired — stop).
//      • JsonWebTokenError       → fall through (might be a SuperAdmin token).
//
//   2. Try verifySuperAdminToken (JWT_SUPERADMIN_SECRET).
//      • Success + type = superadmin → allow.
//      • TokenExpiredError            → 401 (stop).
//      • JsonWebTokenError            → 401 (token is not valid for either secret).

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken, verifySuperAdminToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";

export const adminsAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers["authorization"];

	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({
			error: "Unauthorized",
			message: "Bearer token required",
		});
		return;
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Unauthorized", message: "Token missing" });
		return;
	}

	// ─── Attempt 1: regular user access token ────────────────────────────────
	try {
		const payload = verifyAccessToken(token);

		// Signature verified against JWT_ACCESS_SECRET — this is a user/company token.
		const user = await prisma.user.findUnique({
			where: { id: payload.sub },
			select: { id: true, role: true, deletedAt: true },
		});

		if (!user || user.deletedAt) {
			res.status(401).json({
				error: "Unauthorized",
				message: "Account not found or deactivated",
			});
			return;
		}

		if (user.role !== "ADMIN") {
			// Valid token, authenticated user — but wrong role. Don't fall through.
			res.status(403).json({
				error: "Forbidden",
				message: "Admin role required to access this resource",
			});
			return;
		}

		// ✓ Valid ADMIN user
		next();
		return;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			// Definitely a user token (signature passed) but expired — don't try superadmin.
			res
				.status(401)
				.json({ error: "Unauthorized", message: "Access token expired" });
			return;
		}
		// JsonWebTokenError (bad signature) → could be a SuperAdmin token; fall through.
	}

	// ─── Attempt 2: SuperAdmin token ─────────────────────────────────────────
	try {
		const payload = verifySuperAdminToken(token);

		if (payload.type !== "superadmin") {
			res
				.status(403)
				.json({ error: "Forbidden", message: "Invalid token type" });
			return;
		}

		const admin = await prisma.superAdmin.findUnique({
			where: { id: payload.sub },
			select: { id: true },
		});

		if (!admin) {
			res.status(403).json({
				error: "Forbidden",
				message: "SuperAdmin account not found",
			});
			return;
		}

		// ✓ Valid SuperAdmin
		next();
		return;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res
				.status(401)
				.json({ error: "Unauthorized", message: "SuperAdmin token expired" });
			return;
		}
		// JsonWebTokenError — neither secret matched
	}

	logger.warn("adminOrSuperAdminAuth: token rejected", {
		ip: req.ip,
		path: req.path,
	});

	res.status(401).json({
		error: "Unauthorized",
		message: "Valid admin or superadmin token required",
	});
};
