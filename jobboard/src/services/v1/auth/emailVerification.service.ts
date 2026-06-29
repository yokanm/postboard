// src/services/v1/auth/emailVerification.service.ts

import config from "@/config";
import { in24h, makeToken } from "@/lib";
import {
	companyVerificationEmailHtml,
	sendEmail,
	verificationEmailHtml,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";

// ─── User ──────────────────────────────────────────────────────────────────────

export const sendUserVerificationEmailService = async (email: string) => {
	const normalized = email.toLowerCase().trim();
	const user = await prisma.user.findUnique({ where: { email: normalized } });

	// Always succeeds — prevents email enumeration
	if (!user || user.deletedAt) return;
	if (user.isVerified) throw new AppError("Email is already verified.", 400);

	const token = makeToken();
	const hashedToken = hashToken(token);
	await prisma.user.update({
		where: { id: user.id },
		data: { emailVerifyToken: hashedToken, emailVerifyExpiresAt: in24h() },
	});

	const link = `${config.FRONTEND_URL}/verify-email?token=${token}`;
	await sendEmail({
		to: user.email,
		subject: "Verify your email address",
		html: verificationEmailHtml(user.firstName, link),
	});

	logger.info("Verification email sent", { userId: user.id });
};

export const verifyUserEmailService = async (token: string) => {
	if (!token) throw new AppError("Verification token is required.", 400);

	// Try hashed token first (new system), fall back to raw token (legacy records)
	const hashedToken = hashToken(token);
	let user = await prisma.user.findUnique({
		where: { emailVerifyToken: hashedToken },
	});
	if (!user) {
		user = await prisma.user.findUnique({
			where: { emailVerifyToken: token },
		});
	}
	if (
		!user ||
		!user.emailVerifyExpiresAt ||
		user.emailVerifyExpiresAt < new Date()
	) {
		throw new AppError("Token is invalid or has expired.", 400);
	}

	await prisma.user.update({
		where: { id: user.id },
		data: {
			isVerified: true,
			emailVerifyToken: null,
			emailVerifyExpiresAt: null,
		},
	});

	logger.info("User email verified", { userId: user.id });
};

// ─── Company ───────────────────────────────────────────────────────────────────

export const sendCompanyVerificationEmailService = async (email: string) => {
	const normalized = email.toLowerCase().trim();
	const company = await prisma.company.findUnique({
		where: { email: normalized },
	});

	if (!company || company.deletedAt) return;
	if (company.isVerified)
		throw new AppError("Company email is already verified.", 400);

	const token = makeToken();
	const hashedToken = hashToken(token);
	await prisma.company.update({
		where: { id: company.id },
		data: { emailVerifyToken: hashedToken, emailVerifyExpiresAt: in24h() },
	});

	const link = `${config.FRONTEND_URL}/verify-email?token=${token}`;
	await sendEmail({
		to: company.email,
		subject: "Verify your company email address",
		html: companyVerificationEmailHtml(company.name, link),
	});

	logger.info("Company verification email sent", { companyId: company.id });
};

export const verifyCompanyEmailService = async (token: string) => {
	if (!token) throw new AppError("Verification token is required.", 400);

	// Try hashed token first (new system), fall back to raw token (legacy records)
	const hashedToken = hashToken(token);
	let company = await prisma.company.findUnique({
		where: { emailVerifyToken: hashedToken },
	});
	if (!company) {
		company = await prisma.company.findUnique({
			where: { emailVerifyToken: token },
		});
	}
	if (
		!company ||
		!company.emailVerifyExpiresAt ||
		company.emailVerifyExpiresAt < new Date()
	) {
		throw new AppError("Token is invalid or has expired.", 400);
	}

	await prisma.company.update({
		where: { id: company.id },
		data: {
			isVerified: true,
			emailVerifyToken: null,
			emailVerifyExpiresAt: null,
		},
	});

	logger.info("Company email verified", { companyId: company.id });
};
