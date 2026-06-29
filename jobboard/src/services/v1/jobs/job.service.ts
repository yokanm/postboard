// src/services/v1/jobs/job.service.ts
// Phase 5 — Search uses pg_trgm via Prisma's `contains` + `mode: 'insensitive'`.
// Prisma compiles this to: WHERE title ILIKE '%keyword%'
// PostgreSQL hits the GIN trigram index — fast, typo-tolerant, zero raw SQL.
//
// Nothing about the listJobsService signature or shape changes.
// The controller, route, and validator files are untouched.

import { createSlug } from "@/lib";
import { notifyJobPosted } from "@/lib/notification";
import { assertCanDeleteJob, assertCanManageJob } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import type {
	CreateJobInput,
	ExperienceLevel,
	JobStatus,
	ListJobsInput,
	LocationType,
	UpdateJobInput,
	UpdateJobStatusInput,
} from "@/types";

// ─── Status machine ────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
	DRAFT: ["OPEN"],
	OPEN: ["CLOSED"],
	CLOSED: [],
	EXPIRED: [],
};

// ─── Create job ────────────────────────────────────────────────────────────────

export const createJobService = async (
	companyId: string,
	userId: string,
	input: CreateJobInput,
) => {
	const {
		title,
		description,
		location,
		locationType,
		salaryMin,
		salaryMax,
		currency,
		experienceLevel,
		tags,
		expiresAt,
	} = input;

	const slug = `${createSlug(title)}-${Date.now()}`;

	// Upsert tags by slug — idempotent, safe for concurrent requests
	const tagRecords = await Promise.all(
		(tags ?? []).map((name) => {
			const tagSlug = createSlug(name);
			return prisma.tag.upsert({
				where: { slug: tagSlug },
				create: { name: name.trim(), slug: tagSlug },
				update: {},
				select: { id: true },
			});
		}),
	);

	const job = await prisma.job.create({
		data: {
			title: title.trim(),
			slug,
			description,
			location: location || null,
			locationType: (locationType as LocationType) ?? "ONSITE",
			salaryMin: salaryMin ?? null,
			salaryMax: salaryMax ?? null,
			currency: currency ?? "USD",
			experienceLevel: (experienceLevel as ExperienceLevel) ?? "MID",
			companyId,
			postedById: userId,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			tags: { create: tagRecords.map((tag) => ({ tagId: tag.id })) },
		},
		include: {
			tags: {
				include: { tag: { select: { id: true, name: true, slug: true } } },
			},
			company: { select: { id: true, name: true, logoUrl: true } },
		},
	});

	// Notify when the job is immediately live (no DRAFT step)
	if (job.status === "OPEN") {
		void notifyJobPosted(companyId, job.id, job.title);
	}

	logger.info("Job created", { jobId: job.id, companyId });
	return job;
};

// ─── List jobs ─────────────────────────────────────────────────────────────────
// Keyword search uses Prisma `contains` + `mode: 'insensitive'` which Postgres
// resolves with the GIN trigram index from the Phase 5 migration.
// No raw SQL. No separate code path. No parameter indexing.

export const listJobsService = async (input: ListJobsInput) => {
	const {
		cursor,
		limit = "20",
		status,
		locationType,
		experienceLevel,
		companyId,
		keyword,
	} = input;

	const take = Math.min(parseInt(limit, 10) || 20, 100);

	// Build the where clause — each field is optional and composes cleanly
	const where = {
		deletedAt: null,

		// Default to OPEN jobs; allow explicit status override (recruiter dashboard)
		...(status
			? { status: status as JobStatus }
			: { status: "OPEN" as JobStatus }),

		...(locationType && { locationType: locationType as LocationType }),
		...(experienceLevel && {
			experienceLevel: experienceLevel as ExperienceLevel,
		}),
		...(companyId && { companyId }),

		// Keyword: search title AND description via trigram index
		// Prisma OR compiles to: WHERE (title ILIKE '%kw%' OR description ILIKE '%kw%')
		...(keyword?.trim() && {
			OR: [
				{ title: { contains: keyword.trim(), mode: "insensitive" as const } },
				{
					description: {
						contains: keyword.trim(),
						mode: "insensitive" as const,
					},
				},
			],
		}),
	};

	const jobs = await prisma.job.findMany({
		where,
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			slug: true,
			location: true,
			locationType: true,
			salaryMin: true,
			salaryMax: true,
			currency: true,
			status: true,
			experienceLevel: true,
			expiresAt: true,
			createdAt: true,
			company: { select: { id: true, name: true, logoUrl: true, slug: true } },
			tags: { include: { tag: { select: { name: true, slug: true } } } },
		},
	});

	const hasNextPage = jobs.length > take;
	const items = hasNextPage ? jobs.slice(0, -1) : jobs;

	return {
		jobs: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

// ─── Get single job ────────────────────────────────────────────────────────────

export const getJobService = async (id: string) => {
	const job = await prisma.job.findUnique({
		where: { id, deletedAt: null },
		include: {
			company: {
				select: {
					id: true,
					name: true,
					slug: true,
					logoUrl: true,
					website: true,
					industry: true,
				},
			},
			tags: {
				include: { tag: { select: { id: true, name: true, slug: true } } },
			},
			postedBy: {
				select: { id: true, userName: true, firstName: true, lastName: true },
			},
		},
	});

	if (!job) throw new AppError("Job not found.", 404);
	return job;
};

// ─── Update job ────────────────────────────────────────────────────────────────

export const updateJobService = async (
	id: string,
	companyId: string,
	input: UpdateJobInput,
	actorId?: string,
	actorRole?: string,
) => {
	const existing = await prisma.job.findUnique({
		where: { id, deletedAt: null },
		select: { companyId: true, postedById: true },
	});

	if (!existing) throw new AppError("Job not found.", 404);
	assertCanManageJob(
		{ id: actorId ?? "", role: actorRole ?? "ADMIN", companyId },
		existing,
	);

	const {
		title,
		description,
		location,
		locationType,
		salaryMin,
		salaryMax,
		currency,
		experienceLevel,
		tags,
		expiresAt,
	} = input;

	const updateData: Record<string, unknown> = {};
	if (title !== undefined) {
		updateData["title"] = title.trim();
		updateData["slug"] = `${createSlug(title)}-${Date.now()}`;
	}
	if (description !== undefined) updateData["description"] = description;
	if (location !== undefined) updateData["location"] = location || null;
	if (locationType !== undefined) updateData["locationType"] = locationType;
	if (salaryMin !== undefined) updateData["salaryMin"] = salaryMin;
	if (salaryMax !== undefined) updateData["salaryMax"] = salaryMax;
	if (currency !== undefined) updateData["currency"] = currency;
	if (experienceLevel !== undefined)
		updateData["experienceLevel"] = experienceLevel;
	if (expiresAt !== undefined)
		updateData["expiresAt"] = expiresAt ? new Date(expiresAt) : null;

	const job = await prisma.$transaction(async (tx) => {
		if (tags !== undefined) {
			const tagRecords = await Promise.all(
				tags.map((name) => {
					const tagSlug = createSlug(name);
					return tx.tag.upsert({
						where: { slug: tagSlug },
						create: { name: name.trim(), slug: tagSlug },
						update: {},
						select: { id: true },
					});
				}),
			);
			// Replace all tags atomically
			await tx.jobTag.deleteMany({ where: { jobId: id } });
			await tx.jobTag.createMany({
				data: tagRecords.map((t) => ({ jobId: id, tagId: t.id })),
				skipDuplicates: true,
			});
		}

		return tx.job.update({
			where: { id },
			data: updateData,
			include: {
				tags: {
					include: { tag: { select: { id: true, name: true, slug: true } } },
				},
			},
		});
	});

	logger.info("Job updated", { jobId: job.id, companyId });
	return job;
};

// ─── Update job status ─────────────────────────────────────────────────────────

export const updateJobStatusService = async (
	id: string,
	companyId: string,
	input: UpdateJobStatusInput,
	actorId?: string,
	actorRole?: string,
) => {
	const { status } = input;

	const existing = await prisma.job.findUnique({
		where: { id, deletedAt: null },
		select: { companyId: true, postedById: true, status: true, title: true },
	});

	if (!existing) throw new AppError("Job not found.", 404);
	assertCanManageJob(
		{ id: actorId ?? "", role: actorRole ?? "ADMIN", companyId },
		existing,
	);

	const allowed = VALID_TRANSITIONS[existing.status] ?? [];
	if (!allowed.includes(status)) {
		throw new AppError(
			`Cannot transition from ${existing.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
			422,
		);
	}

	const job = await prisma.job.update({
		where: { id },
		data: { status },
		select: { id: true, status: true, updatedAt: true },
	});

	// Fire notification and audit log when job goes live
	if (status === "OPEN") {
		void notifyJobPosted(companyId, id, existing.title);
		void writeAuditLog(
			actorId ?? "",
			"PUBLISH_JOB",
			"JOB",
			id,
			{ title: existing.title },
			companyId,
		);
	}

	logger.info("Job status updated", {
		jobId: job.id,
		from: existing.status,
		to: status,
	});
	return job;
};

// ─── Delete job ────────────────────────────────────────────────────────────────

export const deleteJobService = async (
	id: string,
	actorId: string,
	companyId: string,
) => {
	const existing = await prisma.job.findUnique({
		where: { id, deletedAt: null },
		select: { companyId: true },
	});

	if (!existing) throw new AppError("Job not found.", 404);
	assertCanDeleteJob({ role: "ADMIN", companyId }, existing);

	await prisma.job.update({
		where: { id },
		data: { deletedAt: new Date(), status: "CLOSED" },
	});

	void writeAuditLog(actorId, "DELETE_JOB", "JOB", id, {}, companyId);
	logger.info("Job soft-deleted", { jobId: id, companyId });
};
