// src/services/v1/company/company.service.ts

import { createSlug } from "@/lib";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import type { UpdateCompanyInput } from "@/types";

// ─── Get company profile ───────────────────────────────────────────────────────

export const getCompanyProfileService = async (companyId: string) => {
	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: {
			id: true,
			name: true,
			slug: true,
			logoUrl: true,
			website: true,
			industry: true,
			size: true,
			isVerified: true,
			deletedAt: true,
			createdAt: true,
			_count: { select: { jobs: true, users: true } },
		},
	});

	if (!company || company.deletedAt)
		throw new AppError("Company not found.", 404);
	return company;
};

// ─── Update company profile ────────────────────────────────────────────────────

export const updateCompanyProfileService = async (
	companyId: string,
	input: UpdateCompanyInput,
) => {
	const { name, website, industry, size } = input;

	const updateData: Record<string, unknown> = {};
	if (name) {
		updateData["name"] = name.trim();
		updateData["slug"] = `${createSlug(name)}-${Date.now()}`;
	}
	if (website !== undefined) updateData["website"] = website || null;
	if (industry !== undefined) updateData["industry"] = industry || null;
	if (size !== undefined) updateData["size"] = size || null;

	const company = await prisma.company.update({
		where: { id: companyId },
		data: updateData,
		select: {
			id: true,
			name: true,
			slug: true,
			email: true,
			logoUrl: true,
			website: true,
			industry: true,
			size: true,
			isVerified: true,
			updatedAt: true,
		},
	});

	logger.info("Company profile updated", { companyId: company.id });
	return company;
};

// ─── Upload company logo ───────────────────────────────────────────────────────

export const uploadCompanyLogoService = async (
	companyId: string,
	fileBuffer: Buffer,
) => {
	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: { logoUrl: true },
	});

	if (company?.logoUrl) {
		const segments = company.logoUrl.split("/");
		const publicId = segments
			.slice(-2)
			.join("/")
			.replace(/\.[^.]+$/, "");
		await deleteFromCloudinary(publicId, "image");
	}

	const { url } = await uploadToCloudinary(
		fileBuffer,
		"company-logos",
		"image",
	);

	const updated = await prisma.company.update({
		where: { id: companyId },
		data: { logoUrl: url },
		select: { id: true, logoUrl: true },
	});

	logger.info("Company logo uploaded", { companyId: updated.id });
	return updated.logoUrl;
};

// ─── Delete company logo ───────────────────────────────────────────────────────

export const deleteCompanyLogoService = async (companyId: string) => {
	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: { logoUrl: true },
	});

	if (!company?.logoUrl) throw new AppError("No logo found.", 404);

	const segments = company.logoUrl.split("/");
	const publicId = segments
		.slice(-2)
		.join("/")
		.replace(/\.[^.]+$/, "");
	await deleteFromCloudinary(publicId, "image");

	await prisma.company.update({
		where: { id: companyId },
		data: { logoUrl: null },
	});

	logger.info("Company logo deleted", { companyId });
};

// ─── Delete company ────────────────────────────────────────────────────────────

export const deleteCompanyService = async (
	companyId: string,
	password: string,
	actorId?: string,
) => {
	const company = await prisma.company.findUnique({ where: { id: companyId } });
	if (!company || company.deletedAt)
		throw new AppError("Company not found.", 404);

	const match = await verifyPassword(password, company.password);
	if (!match) throw new AppError("Incorrect password.", 401);

	await prisma.$transaction([
		prisma.company.update({
			where: { id: company.id },
			data: { deletedAt: new Date() },
		}),
		prisma.user.updateMany({
			where: { companyId: company.id, deletedAt: null },
			data: { deletedAt: new Date() },
		}),
		prisma.job.updateMany({
			where: {
				companyId: company.id,
				status: { in: ["OPEN", "DRAFT"] },
				deletedAt: null,
			},
			data: { status: "CLOSED", deletedAt: new Date() },
		}),
		prisma.refreshToken.updateMany({
			where: { companyId: company.id, isRevoked: false },
			data: { isRevoked: true },
		}),
		prisma.refreshToken.updateMany({
			where: { user: { companyId: company.id }, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(
		actorId ?? company.id,
		"DELETE_COMPANY",
		"COMPANY",
		company.id,
	);
	logger.info("Company deactivated", { companyId: company.id });
};
