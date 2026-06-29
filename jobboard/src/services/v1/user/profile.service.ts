// src/services/v1/user/profile.service.ts

import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import type { UpsertProfileInput } from "@/types";

// ─── Get profile ───────────────────────────────────────────────────────────────

export const getProfileService = async (userId: string) => {
	const profile = await prisma.userProfile.findUnique({ where: { userId } });
	return profile ?? null;
};

// ─── Upsert profile ────────────────────────────────────────────────────────────

export const upsertProfileService = async (
	userId: string,
	input: UpsertProfileInput,
) => {
	const { bio, linkedinUrl, githubUrl, skills, location } = input;

	const data = {
		...(bio !== undefined && { bio: bio || null }),
		...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
		...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
		...(location !== undefined && { location: location || null }),
		...(skills !== undefined && {
			skills: Array.isArray(skills)
				? skills.map((s) => s.trim()).filter(Boolean)
				: [],
		}),
	};

	const profile = await prisma.userProfile.upsert({
		where: { userId },
		create: { userId, ...data },
		update: data,
	});

	logger.info("Profile upserted", { userId });
	return profile;
};

// ─── Upload resume ─────────────────────────────────────────────────────────────

export const uploadResumeService = async (
	userId: string,
	fileBuffer: Buffer,
) => {
	const existing = await prisma.userProfile.findUnique({
		where: { userId },
		select: { resumePublicId: true },
	});

	if (existing?.resumePublicId) {
		await deleteFromCloudinary(existing.resumePublicId, "raw");
	}

	const { url, publicId } = await uploadToCloudinary(
		fileBuffer,
		"resumes",
		"raw",
	);

	const profile = await prisma.userProfile.upsert({
		where: { userId },
		create: { userId, resumeUrl: url, resumePublicId: publicId },
		update: { resumeUrl: url, resumePublicId: publicId },
	});

	logger.info("Resume uploaded", { userId, publicId });
	return profile.resumeUrl;
};

// ─── Delete resume ─────────────────────────────────────────────────────────────

export const deleteResumeService = async (userId: string) => {
	const profile = await prisma.userProfile.findUnique({
		where: { userId },
		select: { resumePublicId: true },
	});

	if (!profile?.resumePublicId) throw new AppError("No resume found.", 404);

	await deleteFromCloudinary(profile.resumePublicId, "raw");

	await prisma.userProfile.update({
		where: { userId },
		data: { resumeUrl: null, resumePublicId: null },
	});

	logger.info("Resume deleted", { userId });
};
