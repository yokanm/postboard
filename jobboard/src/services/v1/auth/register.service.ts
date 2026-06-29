// src/services/v1/auth/register.service.ts

import config from "@/config";
import { createSlug, in24h, makeToken } from "@/lib";
import {
	companyVerificationEmailHtml,
	sendEmail,
	verificationEmailHtml,
} from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import type { RegisterCompanyInput, RegisterUserInput } from "@/types";

// ─── Register user ─────────────────────────────────────────────────────────────

export const registerUserService = async (input: RegisterUserInput) => {
	const {
		userName,
		email,
		firstName,
		lastName,
		password,
		role,
		phone,
		companyId,
	} = input;
	const safeRole = role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";
	const normalizedEmail = email.toLowerCase().trim();

	const existingEmail = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});
	if (existingEmail) throw new AppError("Email already exists", 409);

	const existingUserName = await prisma.user.findFirst({
		where: { userName, deletedAt: null },
	});
	if (existingUserName) throw new AppError("Username already taken", 409);

	if (companyId) {
		if (safeRole === "RECRUITER") {
			throw new AppError(
				"Recruiter registration with company enrollment is not supported. Use the team invitation flow.",
				422,
			);
		}
		const company = await prisma.company.findUnique({
			where: { id: companyId },
		});
		if (!company || company.deletedAt)
			throw new AppError("Company not found", 404);
	}

	const hashedPassword = await hashPassword(password);
	const verifyToken = makeToken();
	const hashedVerifyToken = hashToken(verifyToken);

	const newUser = await prisma.user.create({
		data: {
			userName,
			email: normalizedEmail,
			firstName,
			lastName,
			password: hashedPassword,
			role: safeRole,
			phone,
			companyId: companyId?.trim() || null,
			emailVerifyToken: hashedVerifyToken,
			emailVerifyExpiresAt: in24h(),
		},
	});

	const link = `${config.FRONTEND_URL}/verify-email?token=${verifyToken}`;
	sendEmail({
		to: newUser.email,
		subject: "Verify your email address",
		html: verificationEmailHtml(newUser.firstName, link),
	}).catch((err) =>
		logger.error("Verification email failed after register", err),
	);

	logger.info("User registered", { email: newUser.email, role: newUser.role });

	return {
		user: {
			id: newUser.id,
			userName: newUser.userName,
			email: newUser.email,
			role: newUser.role,
			isVerified: newUser.isVerified,
		},
	};
};

// ─── Register company ──────────────────────────────────────────────────────────

export const registerCompanyService = async (input: RegisterCompanyInput) => {
	const {
		companyName,
		companyEmail,
		companyPassword,
		userName,
		firstName,
		lastName,
		userEmail,
		userPassword,
	} = input;

	const normalizedCompanyEmail = companyEmail.toLowerCase().trim();
	const normalizedUserEmail = userEmail.toLowerCase().trim();

	const [existingCompany, existingUser] = await Promise.all([
		prisma.company.findUnique({ where: { email: normalizedCompanyEmail } }),
		prisma.user.findUnique({ where: { email: normalizedUserEmail } }),
	]);

	if (existingCompany)
		throw new AppError("Company email already registered", 409);
	if (existingUser) throw new AppError("User email already exists", 409);

	const [hashedCompanyPassword, hashedUserPassword] = await Promise.all([
		hashPassword(companyPassword),
		hashPassword(userPassword),
	]);

	const slug = `${createSlug(companyName)}-${Date.now()}`;
	const companyVerifyToken = makeToken();
	const userVerifyToken = makeToken();
	const hashedCompanyVerifyToken = hashToken(companyVerifyToken);
	const hashedUserVerifyToken = hashToken(userVerifyToken);

	const result = await prisma.$transaction(async (tx) => {
		const company = await tx.company.create({
			data: {
				name: companyName,
				email: normalizedCompanyEmail,
				password: hashedCompanyPassword,
				slug,
				emailVerifyToken: hashedCompanyVerifyToken,
				emailVerifyExpiresAt: in24h(),
			},
		});

		const user = await tx.user.create({
			data: {
				userName,
				firstName,
				lastName,
				email: normalizedUserEmail,
				password: hashedUserPassword,
				role: "ADMIN",
				companyId: company.id,
				emailVerifyToken: hashedUserVerifyToken,
				emailVerifyExpiresAt: in24h(),
			},
		});

		const ownedCompany = await tx.company.update({
			where: { id: company.id },
			data: { primaryAdminId: user.id },
		});

		return { company: ownedCompany, user };
	});

	const companyLink = `${config.FRONTEND_URL}/verify-email?token=${companyVerifyToken}`;
	const userLink = `${config.FRONTEND_URL}/verify-email?token=${userVerifyToken}`;

	Promise.all([
		sendEmail({
			to: result.company.email,
			subject: "Verify your company email",
			html: companyVerificationEmailHtml(result.company.name, companyLink),
		}),
		sendEmail({
			to: result.user.email,
			subject: "Verify your email address",
			html: verificationEmailHtml(result.user.firstName, userLink),
		}),
	]).catch((err) =>
		logger.error("Verification emails failed after company register", err),
	);

	logger.info("Company registered", {
		companyId: result.company.id,
		adminId: result.user.id,
	});

	return { companyId: result.company.id, userId: result.user.id };
};
