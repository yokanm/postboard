import {
	ADMIN_LIMIT_ERROR,
	assertCompanyOwner,
	isCompanyOwner,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import { recordOwnershipTransfer } from "@/services/v1/company/ownershipHistory.service";
import { writeSecurityEvent } from "@/services/v1/security/security.service";

type PrismaLike = typeof prisma;

export type CompanyOwnership = {
	id: string;
	primaryAdminId: string | null;
	deletedAt?: Date | null;
};

export const getCompanyOwnershipService = async (
	companyId: string,
	client: PrismaLike = prisma,
): Promise<CompanyOwnership> => {
	const company = (await client.company.findUnique({
		where: { id: companyId },
		select: { id: true, primaryAdminId: true, deletedAt: true },
	})) as CompanyOwnership | null;

	if (!company || company.deletedAt)
		throw new AppError("Company not found.", 404);
	if (!company.primaryAdminId) {
		throw new AppError(
			"Company ownership is not configured. SuperAdmin intervention required.",
			409,
		);
	}

	return company;
};

export const getSecondaryAdminService = async (
	companyId: string,
	primaryAdminId: string,
	client: PrismaLike = prisma,
) => {
	return client.user.findFirst({
		where: {
			companyId,
			role: "ADMIN",
			id: { not: primaryAdminId },
			deletedAt: null,
		},
		select: { id: true },
	}) as Promise<{ id: string } | null>;
};

export const assertCanAddSecondaryAdminService = async (
	companyId: string,
	primaryAdminId: string,
	targetUserId?: string,
	client: PrismaLike = prisma,
): Promise<void> => {
	const existing = await getSecondaryAdminService(
		companyId,
		primaryAdminId,
		client,
	);
	if (existing && existing.id !== targetUserId) {
		throw new AppError(ADMIN_LIMIT_ERROR, 409);
	}
};

export const transferCompanyOwnershipService = async (
	companyId: string,
	actorUserId: string,
	targetUserId: string,
	ipAddress?: string,
	userAgent?: string,
): Promise<{ primaryAdminId: string }> => {
	if (actorUserId === targetUserId) {
		throw new AppError("Target user is already the company owner.", 400);
	}

	return prisma.$transaction(async (tx) => {
		const company = await getCompanyOwnershipService(
			companyId,
			tx as PrismaLike,
		);
		assertCompanyOwner({ id: actorUserId, role: "ADMIN", companyId }, company);

		const target = (await tx.user.findUnique({
			where: { id: targetUserId },
			select: { id: true, role: true, companyId: true, deletedAt: true },
		})) as {
			id: string;
			role: string;
			companyId: string | null;
			deletedAt: Date | null;
		} | null;

		if (!target || target.deletedAt || target.companyId !== companyId) {
			throw new AppError("Team member not found in your company.", 404);
		}
		if (target.role !== "ADMIN") {
			throw new AppError(
				"Ownership can only be transferred to the secondary admin.",
				422,
			);
		}
		if (isCompanyOwner(target, company)) {
			throw new AppError("Target user is already the company owner.", 400);
		}

		await tx.company.update({
			where: { id: companyId },
			data: { primaryAdminId: target.id },
		});

		await recordOwnershipTransfer(
			companyId,
			actorUserId,
			target.id,
			actorUserId,
			"Ownership transfer via team management",
			ipAddress,
			userAgent,
		);

		return { primaryAdminId: target.id };
	}) as Promise<{ primaryAdminId: string }>;
};

export const reassignOwnerOnExitService = async (
	companyId: string,
	ownerUserId: string,
	client: PrismaLike = prisma,
): Promise<string | null> => {
	const company = (await client.company.findUnique({
		where: { id: companyId },
		select: { id: true, primaryAdminId: true, deletedAt: true },
	})) as CompanyOwnership | null;

	if (!company || company.deletedAt || company.primaryAdminId !== ownerUserId) {
		return null;
	}

	const secondaryAdmin = await getSecondaryAdminService(
		companyId,
		ownerUserId,
		client,
	);
	if (!secondaryAdmin) {
		throw new AppError(
			"Company owner cannot be removed without a secondary admin. SuperAdmin intervention required.",
			409,
		);
	}

	await client.company.update({
		where: { id: companyId },
		data: { primaryAdminId: secondaryAdmin.id },
	});

	return secondaryAdmin.id;
};
