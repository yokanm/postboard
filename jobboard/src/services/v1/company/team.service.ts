// src/services/v1/company/team.service.ts

import {
	assertCanRemoveTeamMember,
	assertCompanyOwner,
	isCompanyOwner,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import {
	assertCanAddSecondaryAdminService,
	getCompanyOwnershipService,
	reassignOwnerOnExitService,
	transferCompanyOwnershipService,
} from "@/services/v1/company/ownership.service";
import { writeSecurityEvent } from "@/services/v1/security/security.service";
import type { InviteTeamMemberInput, UpdateTeamMemberRoleInput } from "@/types";

// ─── List team members ─────────────────────────────────────────────────────────

export const listTeamMembersService = async (
	companyId: string,
	cursor?: string,
	limit = 20,
) => {
	const take = Math.min(limit, 100);

	const members = await prisma.user.findMany({
		where: { companyId, deletedAt: null },
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			userName: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			isVerified: true,
			createdAt: true,
			primaryAdminFor: { select: { id: true } },
		},
	});

	const hasNextPage = members.length > take;
	const items = hasNextPage ? members.slice(0, -1) : members;
	return {
		members: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

// ─── Invite team member ────────────────────────────────────────────────────────

export const inviteTeamMemberService = async (
	adminUserId: string,
	adminCompanyId: string,
	input: InviteTeamMemberInput,
) => {
	const { email, role } = input;
	const normalized = email.toLowerCase().trim();

	const target = await prisma.user.findUnique({
		where: { email: normalized },
		select: { id: true, companyId: true, deletedAt: true },
	});

	if (!target || target.deletedAt) throw new AppError("User not found.", 404);
	if (target.companyId === adminCompanyId)
		throw new AppError("User is already a member of this company.", 409);
	if (target.companyId)
		throw new AppError("User already belongs to another company.", 409);

	const safeRole = role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";

	const updated = await prisma.user.update({
		where: { id: target.id },
		data: { companyId: adminCompanyId, role: safeRole },
		select: { id: true, userName: true, email: true, role: true },
	});

	void writeAuditLog(
		adminUserId,
		"INVITE_TEAM_MEMBER",
		"USER",
		target.id,
		{ role: safeRole },
		adminCompanyId,
	);
	logger.info("Team member invited", {
		companyId: adminCompanyId,
		userId: target.id,
	});
	return updated;
};

// ─── Update team member role ───────────────────────────────────────────────────

export const updateTeamMemberRoleService = async (
	adminCompanyId: string,
	adminUserId: string,
	memberId: string,
	input: UpdateTeamMemberRoleInput,
) => {
	const { role } = input;

	if (!["ADMIN", "RECRUITER", "CANDIDATE"].includes(role)) {
		throw new AppError("Role must be ADMIN, RECRUITER, or CANDIDATE.", 422);
	}
	if (memberId === adminUserId)
		throw new AppError("You cannot change your own role.", 400);

	const updated = await prisma.$transaction(async (tx) => {
		const txPrisma = tx as typeof prisma;
		await txPrisma.$queryRawUnsafe(
			'SELECT id FROM "Company" WHERE id = $1 FOR UPDATE',
			adminCompanyId,
		);
		const company = await getCompanyOwnershipService(adminCompanyId, txPrisma);
		const actor = { id: adminUserId, role: "ADMIN", companyId: adminCompanyId };

		const target = await txPrisma.user.findUnique({
			where: { id: memberId },
			select: { id: true, companyId: true, role: true, deletedAt: true },
		});

		if (!target || target.deletedAt || target.companyId !== adminCompanyId) {
			throw new AppError("Team member not found in your company.", 404);
		}

		if (isCompanyOwner(target, company)) {
			throw new AppError("Company owner cannot be demoted.", 403);
		}

		if (role === "ADMIN") {
			assertCompanyOwner(actor, company);
			await assertCanAddSecondaryAdminService(
				adminCompanyId,
				company.primaryAdminId!,
				target.id,
				txPrisma,
			);
		} else if (target.role === "ADMIN") {
			assertCompanyOwner(actor, company);
		}

		const previousRole = target.role;
		const effectiveRole =
			previousRole === "ADMIN" && role === "CANDIDATE" ? "RECRUITER" : role;

		return txPrisma.user.update({
			where: { id: memberId },
			data: { role: effectiveRole },
			select: { id: true, userName: true, email: true, role: true },
		}) as Promise<{
			id: string;
			userName: string;
			email: string;
			role: string;
		}>;
	});

	void writeAuditLog(
		adminUserId,
		"UPDATE_TEAM_MEMBER_ROLE",
		"USER",
		memberId,
		{ previousRole, newRole: role },
		adminCompanyId,
	);
	logger.info("Team member role updated", {
		companyId: adminCompanyId,
		memberId,
		role,
	});
	return updated;
};

// ─── Remove team member ────────────────────────────────────────────────────────

export const removeTeamMemberService = async (
	adminCompanyId: string,
	adminUserId: string,
	memberId: string,
	ipAddress?: string,
	userAgent?: string,
) => {
	if (memberId === adminUserId)
		throw new AppError("You cannot remove yourself.", 400);

	const target = await prisma.user.findUnique({
		where: { id: memberId },
		select: { id: true, companyId: true, role: true, deletedAt: true },
	});

	if (!target || target.deletedAt || target.companyId !== adminCompanyId) {
		throw new AppError("Team member not found in your company.", 404);
	}

	const company = await getCompanyOwnershipService(adminCompanyId);
	assertCanRemoveTeamMember(
		{ id: adminUserId, role: "ADMIN", companyId: adminCompanyId },
		target,
		company,
	);

	await prisma.$transaction(async (tx) => {
		await reassignOwnerOnExitService(
			adminCompanyId,
			memberId,
			tx as typeof prisma,
		);

		await tx.user.update({
			where: { id: memberId },
			data: { companyId: null, role: "CANDIDATE" },
		});
	});

	void writeAuditLog(
		adminUserId,
		"REMOVE_TEAM_MEMBER",
		"USER",
		memberId,
		{},
		adminCompanyId,
	);
	void writeSecurityEvent(
		"TEAM_MEMBER_REMOVED",
		"INFO",
		{ removedUserId: memberId, targetRole: target.role },
		adminCompanyId,
		adminUserId,
		ipAddress,
		userAgent,
	);
	logger.info("Team member removed", { companyId: adminCompanyId, memberId });
};

export const transferTeamOwnershipService = async (
	adminCompanyId: string,
	adminUserId: string,
	memberId: string,
	ipAddress?: string,
	userAgent?: string,
) => {
	const result = await transferCompanyOwnershipService(
		adminCompanyId,
		adminUserId,
		memberId,
		ipAddress,
		userAgent,
	);
	void writeAuditLog(
		adminUserId,
		"TRANSFER_COMPANY_OWNERSHIP",
		"USER",
		memberId,
		{},
		adminCompanyId,
		undefined,
		ipAddress,
		userAgent,
	);
	void writeSecurityEvent(
		"OWNERSHIP_CHANGE",
		"WARN",
		{
			companyId: adminCompanyId,
			previousOwnerId: adminUserId,
			newOwnerId: memberId,
		},
		adminCompanyId,
		adminUserId,
		ipAddress,
		userAgent,
	);
	logger.info("Company ownership transferred", {
		companyId: adminCompanyId,
		oldOwnerId: adminUserId,
		newOwnerId: memberId,
	});
	return result;
};
