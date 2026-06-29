// src/services/v1/auth/refreshToken.service.ts

import jwt from "jsonwebtoken";
import config from "@/config";
import { parseTtlMs } from "@/lib";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";
import { AppError } from "@/middleware/errorHandler";
import { writeSecurityEvent } from "@/services/v1/security/security.service";

const { JsonWebTokenError } = jwt;
const REFRESH_TOKEN_TTL = parseTtlMs(config.REFRESH_TOKEN_EXPIRES);

export const refreshTokenService = async (token: string) => {
	let payload;
	try {
		payload = verifyRefreshToken(token);
	} catch (error) {
		if (error instanceof JsonWebTokenError)
			throw new AppError("Invalid refresh token", 401);
		throw new AppError("Token verification failed", 401);
	}

	return prisma.$transaction(async (tx) => {
		const stored = await tx.refreshToken.findUnique({
			where: { token: hashToken(token) },
		});
		if (!stored || stored.expiresAt < new Date()) {
			throw new AppError("Refresh token is no longer valid or expired", 401);
		}

		// Token reuse detection: if already revoked, someone is replaying a stolen token
		if (stored.isRevoked) {
			void writeSecurityEvent(
				"TOKEN_REUSE_DETECTED",
				"CRITICAL",
				{
					userId: stored.userId,
					companyId: stored.companyId,
					tokenId: stored.id,
				},
				stored.companyId ?? undefined,
				stored.userId ?? undefined,
			);
			throw new AppError(
				"Refresh token has already been used. All sessions for this account should be re-authenticated.",
				401,
			);
		}

		if (payload.type === "user") {
			const user = await tx.user.findUnique({
				where: { id: payload.sub },
				select: { id: true, isVerified: true, deletedAt: true },
			});
			if (!user || user.deletedAt)
				throw new AppError("Account not found or deactivated.", 401);
			if (!user.isVerified)
				throw new AppError("Email verification required.", 403);
		} else if (payload.type === "company") {
			const company = await tx.company.findUnique({
				where: { id: payload.sub },
				select: { id: true, isVerified: true, deletedAt: true },
			});
			if (!company || company.deletedAt)
				throw new AppError("Account not found or deactivated.", 401);
			if (!company.isVerified)
				throw new AppError("Email verification required.", 403);
		} else {
			throw new AppError("Invalid refresh token", 401);
		}

		// Rotate: revoke old, issue new pair — atomically within the transaction
		await tx.refreshToken.update({
			where: { id: stored.id },
			data: { isRevoked: true },
		});

		const newAccessToken = generateAccessToken(payload.sub, payload.type);
		const newRefreshToken = generateRefreshToken(payload.sub, payload.type);

		await tx.refreshToken.create({
			data: {
				token: hashToken(newRefreshToken),
				userId: stored.userId ?? undefined,
				companyId: stored.companyId ?? undefined,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
			},
		});

		return { accessToken: newAccessToken, refreshToken: newRefreshToken };
	});
};
