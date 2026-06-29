import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import { recordOwnershipTransfer } from "@/services/v1/company/ownershipHistory.service";
import { writeSecurityEvent } from "@/services/v1/security/security.service";

export const assignCompanyOwnerService = async (
	superAdminId: string,
	companyId: string,
	newOwnerId: string,
	reason?: string,
	ipAddress?: string,
	userAgent?: string,
) => {
	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: { id: true, name: true, primaryAdminId: true, deletedAt: true },
	});

	if (!company || company.deletedAt) {
		throw new AppError("Company not found.", 404);
	}

	const user = await prisma.user.findUnique({
		where: { id: newOwnerId },
		select: { id: true, role: true, companyId: true, deletedAt: true },
	});

	if (!user || user.deletedAt) {
		throw new AppError("User not found or deactivated.", 404);
	}

	if (user.companyId !== companyId) {
		throw new AppError("User does not belong to this company.", 422);
	}

	const previousOwnerId = company.primaryAdminId;

	await prisma.$transaction(async (tx) => {
		await tx.company.update({
			where: { id: companyId },
			data: { primaryAdminId: newOwnerId },
		});

		if (user.role !== "ADMIN") {
			await tx.user.update({
				where: { id: newOwnerId },
				data: { role: "ADMIN" },
			});
		}
	});

	await recordOwnershipTransfer(
		companyId,
		previousOwnerId,
		newOwnerId,
		superAdminId,
		reason || "SuperAdmin reassignment",
		ipAddress,
		userAgent,
	);

	void writeAuditLog(
		superAdminId,
		"SUPERADMIN_ASSIGN_OWNER",
		"COMPANY",
		companyId,
		{ previousOwnerId, newOwnerId, reason, companyName: company.name },
		companyId,
		undefined,
		ipAddress,
		userAgent,
	);

	void writeSecurityEvent(
		"OWNERSHIP_CHANGE",
		"WARN",
		{
			companyId,
			previousOwnerId,
			newOwnerId,
			reason,
			initiatedBy: "SUPERADMIN",
		},
		companyId,
		superAdminId,
		ipAddress,
		userAgent,
	);

	logger.info("SuperAdmin: company owner assigned", {
		superAdminId,
		companyId,
		previousOwnerId,
		newOwnerId,
	});

	return { previousOwnerId, newOwnerId };
};

export const recoverOwnerlessCompanyService = async (
	superAdminId: string,
	companyId: string,
	ipAddress?: string,
	userAgent?: string,
) => {
	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: {
			id: true,
			name: true,
			primaryAdminId: true,
			deletedAt: true,
		},
	});

	if (!company || company.deletedAt) {
		throw new AppError("Company not found.", 404);
	}

	if (company.primaryAdminId) {
		throw new AppError("Company already has an owner.", 409);
	}

	const adminUser = await prisma.user.findFirst({
		where: { companyId, role: "ADMIN", deletedAt: null },
		select: { id: true },
		orderBy: { createdAt: "asc" },
	});

	if (!adminUser) {
		throw new AppError(
			"No ADMIN user found in this company. Cannot recover ownership.",
			409,
		);
	}

	await prisma.company.update({
		where: { id: companyId },
		data: { primaryAdminId: adminUser.id },
	});

	await recordOwnershipTransfer(
		companyId,
		null,
		adminUser.id,
		superAdminId,
		"SuperAdmin recovery of ownerless company",
		ipAddress,
		userAgent,
	);

	void writeAuditLog(
		superAdminId,
		"SUPERADMIN_RECOVER_OWNERSHIP",
		"COMPANY",
		companyId,
		{ newOwnerId: adminUser.id, companyName: company.name },
		companyId,
		undefined,
		ipAddress,
		userAgent,
	);

	void writeSecurityEvent(
		"OWNERSHIP_CHANGE",
		"WARN",
		{ companyId, newOwnerId: adminUser.id, action: "RECOVER_OWNERLESS" },
		companyId,
		superAdminId,
		ipAddress,
		userAgent,
	);

	logger.info("SuperAdmin: ownerless company recovered", {
		superAdminId,
		companyId,
		newOwnerId: adminUser.id,
	});

	return { newOwnerId: adminUser.id };
};
