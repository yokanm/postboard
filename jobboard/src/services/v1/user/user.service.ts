// src/services/v1/user/user.service.ts

import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import type { UpdateUserInput } from "@/types";

// ─── Get current user ──────────────────────────────────────────────────────────

export const getCurrentUserService = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			userName: true,
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			role: true,
			isVerified: true,
			companyId: true,
			createdAt: true,
			profile: {
				select: {
					bio: true,
					resumeUrl: true,
					linkedinUrl: true,
					githubUrl: true,
					skills: true,
					location: true,
				},
			},
		},
	});

	if (!user) throw new AppError("User not found.", 404);
	return user;
};

// ─── Update user ───────────────────────────────────────────────────────────────

export const updateUserService = async (
	userId: string,
	input: UpdateUserInput,
) => {
	const { firstName, lastName, userName, phone } = input;

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, deletedAt: true },
	});
	if (!user || user.deletedAt) throw new AppError("User not found.", 404);

	const updated = await prisma.user.update({
		where: { id: userId },
		data: {
			...(firstName && { firstName: firstName.trim() }),
			...(lastName && { lastName: lastName.trim() }),
			...(userName && { userName: userName.trim() }),
			...(phone !== undefined && { phone: phone || null }),
		},
		select: {
			id: true,
			userName: true,
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			role: true,
			updatedAt: true,
		},
	});

	logger.info("User updated", { userId: updated.id });
	return updated;
};

// ─── Delete user account ───────────────────────────────────────────────────────

export const deleteUserAccountService = async (
	userId: string,
	password: string,
) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user || user.deletedAt) throw new AppError("User not found.", 404);

	const match = await verifyPassword(password, user.password);
	if (!match) throw new AppError("Incorrect password.", 401);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: user.id },
			data: { deletedAt: new Date() },
		}),
		prisma.refreshToken.updateMany({
			where: { userId: user.id, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(
		userId,
		"DELETE_OWN_ACCOUNT",
		"USER",
		userId,
		{},
		user.companyId ?? undefined,
	);
	logger.info("User account deactivated", { userId: user.id });
};
