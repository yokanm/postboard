// src/services/v1/auth/login.service.ts

import config from "@/config";
import { parseTtlMs } from "@/lib/index";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import type { LoginInput } from "@/types";

const REFRESH_TOKEN_TTL = parseTtlMs(config.REFRESH_TOKEN_EXPIRES);

// ─── Login user ────────────────────────────────────────────────────────────────

export const loginUserService = async (input: LoginInput) => {
	const { email, password } = input;
	const normalized = email.toLowerCase().trim();

	const user = await prisma.user.findUnique({ where: { email: normalized } });
	if (!user || user.deletedAt)
		throw new AppError("Email or password is invalid", 401);
	if (!user.isVerified)
		throw new AppError("Email verification required to log in.", 403);

	const match = await verifyPassword(password, user.password);
	if (!match) throw new AppError("Email or password is invalid", 401);

	// Clean up expired tokens (stored as hashes — comparison is by expiry date, not value)
	await prisma.refreshToken.deleteMany({
		where: { userId: user.id, expiresAt: { lt: new Date() } },
	});

	const accessToken = generateAccessToken(user.id, "user");
	const refreshToken = generateRefreshToken(user.id, "user");

	// Store the SHA-256 hash — never the raw token
	await prisma.refreshToken.create({
		data: {
			token: hashToken(refreshToken),
			userId: user.id,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
		},
	});

	logger.info("User login successful", { email: user.email, role: user.role });

	return {
		user: { userName: user.userName, email: user.email, role: user.role },
		accessToken,
		refreshToken, // raw token sent to client — only hash lives in DB
	};
};

// ─── Login company ─────────────────────────────────────────────────────────────

export const loginCompanyService = async (input: LoginInput) => {
	const { email, password } = input;
	const normalized = email.toLowerCase().trim();

	const company = await prisma.company.findUnique({
		where: { email: normalized },
	});
	if (!company || company.deletedAt)
		throw new AppError("Email or password is invalid", 401);
	if (!company.isVerified)
		throw new AppError("Email verification required to log in.", 403);

	const match = await verifyPassword(password, company.password);
	if (!match) throw new AppError("Email or password is invalid", 401);

	await prisma.refreshToken.deleteMany({
		where: { companyId: company.id, expiresAt: { lt: new Date() } },
	});

	const accessToken = generateAccessToken(company.id, "company");
	const refreshToken = generateRefreshToken(company.id, "company");

	await prisma.refreshToken.create({
		data: {
			token: hashToken(refreshToken),
			companyId: company.id,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
		},
	});

	logger.info("Company login successful", { email: company.email });

	return {
		company: { id: company.id, name: company.name, email: company.email },
		accessToken,
		refreshToken,
	};
};
