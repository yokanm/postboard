// src/services/v1/auth/passwordReset.service.ts

import config from "@/config";
import { in1h, makeToken } from "@/lib";
import { passwordResetEmailHtml, sendEmail } from "@/lib/email";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";

// ─── User ──────────────────────────────────────────────────────────────────────

export const forgotUserPasswordService = async (email: string) => {
	const normalized = email.toLowerCase().trim();
	const user = await prisma.user.findUnique({ where: { email: normalized } });

	// Always returns — prevents email enumeration
	if (!user || user.deletedAt) return;

	const token = makeToken();
	const hashedToken = hashToken(token);
	await prisma.user.update({
		where: { id: user.id },
		data: { passwordResetToken: hashedToken, passwordResetExpiresAt: in1h() },
	});

	const link = `${config.FRONTEND_URL}/reset-password?token=${token}`;
	await sendEmail({
		to: user.email,
		subject: "Reset your password",
		html: passwordResetEmailHtml(user.firstName, link),
	});

	logger.info("Password reset email sent", { userId: user.id });
};

export const resetUserPasswordService = async (
	token: string,
	password: string,
) => {
	if (!token) throw new AppError("Reset token is required.", 400);

	// Try hashed token first (new system), fall back to raw token (legacy records)
	const hashedToken = hashToken(token);
	let user = await prisma.user.findUnique({
		where: { passwordResetToken: hashedToken },
	});
	if (!user) {
		user = await prisma.user.findUnique({
			where: { passwordResetToken: token },
		});
	}
	if (
		!user ||
		!user.passwordResetExpiresAt ||
		user.passwordResetExpiresAt < new Date()
	) {
		throw new AppError("Token is invalid or has expired.", 400);
	}

	const hashed = await hashPassword(password);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashed,
				passwordResetToken: null,
				passwordResetExpiresAt: null,
			},
		}),
		prisma.refreshToken.updateMany({
			where: { userId: user.id, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(user.id, "RESET_PASSWORD", "USER", user.id);
	logger.info("User password reset successful", { userId: user.id });
};

export const changeUserPasswordService = async (
	userId: string,
	currentPassword: string,
	newPassword: string,
) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user || user.deletedAt) throw new AppError("User not found.", 404);

	const match = await verifyPassword(currentPassword, user.password);
	if (!match) throw new AppError("Current password is incorrect.", 401);

	const hashed = await hashPassword(newPassword);

	await prisma.$transaction([
		prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
		prisma.refreshToken.updateMany({
			where: { userId: user.id, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(
		userId,
		"CHANGE_PASSWORD",
		"USER",
		userId,
		{},
		user.companyId ?? undefined,
	);
	logger.info("User password changed", { userId: user.id });
};

// ─── Company ───────────────────────────────────────────────────────────────────

export const forgotCompanyPasswordService = async (email: string) => {
	const normalized = email.toLowerCase().trim();
	const company = await prisma.company.findUnique({
		where: { email: normalized },
	});

	if (!company || company.deletedAt) return;

	const token = makeToken();
	const hashedToken = hashToken(token);
	await prisma.company.update({
		where: { id: company.id },
		data: { passwordResetToken: hashedToken, passwordResetExpiresAt: in1h() },
	});

	const link = `${config.FRONTEND_URL}/reset-password?token=${token}`;
	await sendEmail({
		to: company.email,
		subject: "Reset your company account password",
		html: passwordResetEmailHtml(company.name, link),
	});

	logger.info("Company password reset email sent", { companyId: company.id });
};

export const resetCompanyPasswordService = async (
	token: string,
	password: string,
) => {
	if (!token) throw new AppError("Reset token is required.", 400);

	// Try hashed token first (new system), fall back to raw token (legacy records)
	const hashedToken = hashToken(token);
	let company = await prisma.company.findUnique({
		where: { passwordResetToken: hashedToken },
	});
	if (!company) {
		company = await prisma.company.findUnique({
			where: { passwordResetToken: token },
		});
	}
	if (
		!company ||
		!company.passwordResetExpiresAt ||
		company.passwordResetExpiresAt < new Date()
	) {
		throw new AppError("Token is invalid or has expired.", 400);
	}

	const hashed = await hashPassword(password);

	await prisma.$transaction([
		prisma.company.update({
			where: { id: company.id },
			data: {
				password: hashed,
				passwordResetToken: null,
				passwordResetExpiresAt: null,
			},
		}),
		prisma.refreshToken.updateMany({
			where: { companyId: company.id, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(
		company.id,
		"RESET_COMPANY_PASSWORD",
		"COMPANY",
		company.id,
	);
	logger.info("Company password reset successful", { companyId: company.id });
};
