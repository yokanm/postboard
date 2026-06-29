// src/services/v1/jobs/application.service.ts

import { uploadToCloudinary } from "@/lib/cloudinary";
import {
	notifyApplicationReceived,
	notifyApplicationStatusChanged,
} from "@/lib/notification";
import {
	assertCanManageApplication,
	assertCanManageJob,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";
import {
	enqueueApplicationReceivedEmail,
	enqueueApplicationStatusEmail,
} from "@/queues";
import { writeAuditLog } from "@/services/v1/admin/admin.service";
import { createUserNotificationService } from "@/services/v1/notifications/notification.service";
import type {
	ApplicationStatus,
	ApplyInput,
	ListApplicationsInput,
	UpdateApplicationStatusInput,
} from "@/types";

const VALID_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> =
	{
		PENDING: ["REVIEWED", "REJECTED"],
		REVIEWED: ["SHORTLISTED", "REJECTED"],
		SHORTLISTED: ["ACCEPTED", "REJECTED"],
		REJECTED: [],
		ACCEPTED: [],
	};

// ─── Apply to job ──────────────────────────────────────────────────────────────

export const applyToJobService = async (
	jobId: string,
	userId: string,
	input: ApplyInput,
) => {
	const { coverLetter, resumeUrl: bodyResumeUrl, fileBuffer } = input;

	const job = await prisma.job.findUnique({
		where: { id: jobId, deletedAt: null },
		select: { id: true, status: true, companyId: true, title: true },
	});

	if (!job) throw new AppError("Job not found.", 404);
	if (job.status !== "OPEN")
		throw new AppError(
			"This job is not currently accepting applications.",
			422,
		);

	let finalResumeUrl: string | null = bodyResumeUrl ?? null;

	if (fileBuffer) {
		const { url } = await uploadToCloudinary(
			fileBuffer,
			"application-resumes",
			"raw",
		);
		finalResumeUrl = url;
	}

	if (!finalResumeUrl) {
		const profile = await prisma.userProfile.findUnique({
			where: { userId },
			select: { resumeUrl: true },
		});
		finalResumeUrl = profile?.resumeUrl ?? null;
	}

	const application = await prisma.jobApplication.create({
		data: {
			jobId,
			userId,
			coverLetter: coverLetter?.trim() ?? null,
			resumeUrl: finalResumeUrl,
		},
		include: {
			job: { select: { id: true, title: true, companyId: true } },
			user: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
	});

	const applicantName = `${application.user.firstName} ${application.user.lastName}`;

	// 1. Write DB notification (fire-and-forget)
	void notifyApplicationReceived({
		companyId: job.companyId,
		jobId: job.id,
		jobTitle: job.title,
		applicantName,
		applicationId: application.id,
	});

	// 2. Enqueue email to company recruiter(s) via BullMQ
	// Find the first ADMIN/RECRUITER on the company to receive the email
	const recruiter = await prisma.user.findFirst({
		where: {
			companyId: job.companyId,
			role: { in: ["ADMIN", "RECRUITER"] },
			deletedAt: null,
		},
		select: { email: true, firstName: true, lastName: true },
		orderBy: { role: "asc" }, // ADMIN first
	});

	if (recruiter) {
		enqueueApplicationReceivedEmail({
			companyId: job.companyId,
			jobId: job.id,
			jobTitle: job.title,
			applicantName,
			applicationId: application.id,
			recruiterEmail: recruiter.email,
			recruiterName: `${recruiter.firstName} ${recruiter.lastName}`,
		}).catch((error) => {
			logger.error("[QUEUE] Failed to enqueue application-received email", {
				applicationId: application.id,
				companyId: job.companyId,
				error: error instanceof Error ? error.message : String(error),
			});
		});
	} else {
		logger.warn(
			"[QUEUE] No ADMIN/RECRUITER found for company; application email skipped",
			{
				companyId: job.companyId,
				applicationId: application.id,
			},
		);
	}
};

// ─── List applications (recruiter) ────────────────────────────────────────────

export const listApplicationsService = async (
	jobId: string,
	companyId: string,
	input: ListApplicationsInput,
	actorId?: string,
	actorRole?: string,
) => {
	const { status, cursor, limit = "20" } = input;
	const take = Math.min(parseInt(limit, 10) || 20, 100);

	const job = await prisma.job.findUnique({
		where: { id: jobId, deletedAt: null },
		select: { companyId: true, postedById: true },
	});
	if (!job) throw new AppError("Job not found.", 404);
	assertCanManageJob(
		{ id: actorId ?? "", role: actorRole ?? "ADMIN", companyId },
		job,
	);

	const applications = await prisma.jobApplication.findMany({
		where: {
			jobId,
			job: { deletedAt: null },
			...(status && { status: status as ApplicationStatus }),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		include: {
			user: {
				select: {
					id: true,
					userName: true,
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: { resumeUrl: true, skills: true, location: true },
					},
				},
			},
		},
	});

	const hasNextPage = applications.length > take;
	const items = hasNextPage ? applications.slice(0, -1) : applications;
	return {
		applications: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

// ─── Update application status (recruiter) ────────────────────────────────────

export const updateApplicationStatusService = async (
	applicationId: string,
	companyId: string,
	input: UpdateApplicationStatusInput,
	actorId?: string,
	actorRole?: string,
) => {
	const { status, rejectionReason } = input;

	const application = await prisma.jobApplication.findUnique({
		where: { id: applicationId },
		include: {
			job: { select: { companyId: true, title: true, deletedAt: true } },
			user: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
	});

	if (!application) throw new AppError("Application not found.", 404);
	if (application.job.deletedAt)
		throw new AppError("The job for this application has been deleted.", 410);
	assertCanManageApplication(
		{ id: actorId ?? "", role: actorRole ?? "ADMIN", companyId },
		application,
	);

	const allowed = VALID_STATUS_TRANSITIONS[application.status] ?? [];
	if (!allowed.includes(status as ApplicationStatus)) {
		throw new AppError(
			`Cannot transition from ${application.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
			422,
		);
	}

	const updated = await prisma.jobApplication.update({
		where: { id: applicationId },
		data: {
			status: status as ApplicationStatus,
			...(rejectionReason !== undefined && {
				rejectionReason: rejectionReason || null,
			}),
		},
		select: { id: true, status: true, rejectionReason: true, updatedAt: true },
	});

	const candidateName = `${application.user.firstName} ${application.user.lastName}`;

	// 1. Write DB notification for company (recruiter dashboard)
	void notifyApplicationStatusChanged({
		companyId: application.job.companyId,
		jobId: application.jobId,
		jobTitle: application.job.title,
		applicationId: application.id,
		candidateName,
		newStatus: status,
		rejectionReason,
	});

	// 1b. Write DB notification for candidate (user inbox)
	void createUserNotificationService(
		application.user.id,
		"APPLICATION_STATUS_CHANGED",
		`Your application for "${application.job.title}" is now ${status}`,
		{
			applicationId: application.id,
			jobId: application.jobId,
			newStatus: status,
			...(rejectionReason && { rejectionReason }),
		},
	);

	// 2. Enqueue email to candidate
	enqueueApplicationStatusEmail({
		companyId: application.job.companyId,
		jobId: application.jobId,
		jobTitle: application.job.title,
		applicationId: application.id,
		candidateName,
		newStatus: status,
		rejectionReason: rejectionReason ?? undefined,
		candidateEmail: application.user.email,
	}).catch((error) => {
		logger.error("[QUEUE] Failed to enqueue application-status email", {
			applicationId: application.id,
			newStatus: status,
			error: error instanceof Error ? error.message : String(error),
		});
	});

	void writeAuditLog(
		actorId ?? "",
		"UPDATE_APPLICATION_STATUS",
		"APPLICATION",
		applicationId,
		{ from: application.status, to: status, jobTitle: application.job.title },
		application.job.companyId,
	);

	logger.info("Application status updated", {
		applicationId,
		from: application.status,
		to: status,
	});
	return updated;
};

// ─── Get my applications (candidate) ──────────────────────────────────────────

export const getMyApplicationsService = async (
	userId: string,
	cursor?: string,
	limit = 20,
) => {
	const take = Math.min(limit, 100);

	const applications = await prisma.jobApplication.findMany({
		where: { userId, job: { deletedAt: null } },
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		include: {
			job: {
				select: {
					id: true,
					title: true,
					slug: true,
					status: true,
					locationType: true,
					experienceLevel: true,
					company: { select: { id: true, name: true, logoUrl: true } },
				},
			},
		},
	});

	const hasNextPage = applications.length > take;
	const items = hasNextPage ? applications.slice(0, -1) : applications;
	return {
		applications: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

// ─── Withdraw application (candidate) ─────────────────────────────────────────

export const withdrawApplicationService = async (
	applicationId: string,
	userId: string,
) => {
	const application = await prisma.jobApplication.findUnique({
		where: { id: applicationId },
		select: { userId: true, status: true },
	});

	if (!application) throw new AppError("Application not found.", 404);
	if (application.userId !== userId)
		throw new AppError("You do not own this application.", 403);
	if (application.status !== "PENDING") {
		throw new AppError(
			`Cannot withdraw an application with status ${application.status}. Only PENDING applications can be withdrawn.`,
			422,
		);
	}

	await prisma.jobApplication.delete({ where: { id: applicationId } });
	logger.info("Application withdrawn", { applicationId, userId });
};
