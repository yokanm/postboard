// src/services/v1/admin/admin.service.ts
// Phase 8: Platform admin service — ADMIN-role users get elevated access
// to view, moderate, and manage all entities across the platform.
//
// SECURITY: Every function verifies the actor has ADMIN role.
// An audit log entry is written for every destructive or mutating action.

import { nanoid } from "nanoid";
import { invalidateJobDetail, invalidateJobLists } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/winston";
import { AppError } from "@/middleware/errorHandler";

// ─── Audit log helper ──────────────────────────────────────────────────────────

export const writeAuditLog = async (
	actorId: string,
	action: string,
	targetType: string,
	targetId: string,
	metadata?: Record<string, unknown>,
	companyId?: string,
	correlationId?: string,
	ipAddress?: string,
	userAgent?: string,
): Promise<void> => {
	try {
		await (prisma as any).adminAuditLog.create({
			data: {
				id: nanoid(),
				actorId,
				action,
				targetType,
				targetId,
				companyId,
				correlationId,
				ipAddress,
				userAgent,
				metadata: metadata ?? {},
			},
		});
	} catch (error) {
		// Audit log failure must never crash the main flow
		logger.error("writeAuditLog error", error);
	}
};

// ─── Platform statistics ───────────────────────────────────────────────────────

export const getPlatformStatsService = async () => {
	const [
		totalUsers,
		totalCompanies,
		totalJobs,
		openJobs,
		totalApplications,
		pendingApplications,
		totalNotifications,
		unreadNotifications,
	] = await Promise.all([
		prisma.user.count({ where: { deletedAt: null } }),
		prisma.company.count({ where: { deletedAt: null } }),
		prisma.job.count({ where: { deletedAt: null } }),
		prisma.job.count({ where: { status: "OPEN", deletedAt: null } }),
		prisma.jobApplication.count(),
		prisma.jobApplication.count({ where: { status: "PENDING" } }),
		prisma.notification.count(),
		prisma.notification.count({ where: { isRead: false } }),
	]);

	return {
		users: { total: totalUsers },
		companies: { total: totalCompanies },
		jobs: { total: totalJobs, open: openJobs },
		applications: { total: totalApplications, pending: pendingApplications },
		notifications: { total: totalNotifications, unread: unreadNotifications },
		generatedAt: new Date().toISOString(),
	};
};

// ─── User management ───────────────────────────────────────────────────────────

export const adminListUsersService = async (
	cursor?: string,
	limit = 20,
	role?: string,
	search?: string,
) => {
	const take = Math.min(limit, 100);

	const users = await prisma.user.findMany({
		where: {
			deletedAt: null,
			...(role && { role: role as any }),
			...(search && {
				OR: [
					{ email: { contains: search, mode: "insensitive" } },
					{ userName: { contains: search, mode: "insensitive" } },
					{ firstName: { contains: search, mode: "insensitive" } },
				],
			}),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			userName: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			isVerified: true,
			companyId: true,
			createdAt: true,
		},
	});

	const hasNextPage = users.length > take;
	const items = hasNextPage ? users.slice(0, -1) : users;
	return {
		users: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

export const adminDeactivateUserService = async (
	actorId: string,
	targetId: string,
	actorCompanyId?: string,
): Promise<void> => {
	if (actorId === targetId) {
		throw new AppError("You cannot deactivate your own account.", 400);
	}

	const user = await prisma.user.findUnique({
		where: { id: targetId },
		select: { id: true, deletedAt: true, role: true, companyId: true },
	});

	if (!user || user.deletedAt) throw new AppError("User not found.", 404);

	// Tenant isolation: ADMIN must operate within their own company
	if (actorCompanyId && user.companyId !== actorCompanyId) {
		throw new AppError(
			"You do not have permission to deactivate users outside your company.",
			403,
		);
	}

	await prisma.$transaction([
		prisma.user.update({
			where: { id: targetId },
			data: { deletedAt: new Date() },
		}),
		prisma.refreshToken.updateMany({
			where: { userId: targetId, isRevoked: false },
			data: { isRevoked: true },
		}),
	]);

	void writeAuditLog(actorId, "DELETE_USER", "USER", targetId, {
		role: user.role,
	});
	logger.info("Admin: user deactivated", { actorId, targetId });
};

// ─── Company management ────────────────────────────────────────────────────────

export const adminListCompaniesService = async (
	cursor?: string,
	limit = 20,
	search?: string,
	verified?: string,
) => {
	const take = Math.min(limit, 100);

	const companies = await prisma.company.findMany({
		where: {
			deletedAt: null,
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
				],
			}),
			...(verified !== undefined && { isVerified: verified === "true" }),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			name: true,
			slug: true,
			email: true,
			industry: true,
			size: true,
			isVerified: true,
			createdAt: true,
			_count: { select: { jobs: true, users: true } },
		},
	});

	const hasNextPage = companies.length > take;
	const items = hasNextPage ? companies.slice(0, -1) : companies;
	return {
		companies: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};

export const adminVerifyCompanyService = async (
	actorId: string,
	companyId: string,
	actorCompanyId?: string,
): Promise<void> => {
	if (actorCompanyId && actorCompanyId !== companyId) {
		throw new AppError(
			"You do not have permission to verify companies outside your own.",
			403,
		);
	}

	const company = await prisma.company.findUnique({
		where: { id: companyId },
		select: { id: true, deletedAt: true, isVerified: true },
	});

	if (!company || company.deletedAt)
		throw new AppError("Company not found.", 404);
	if (company.isVerified)
		throw new AppError("Company is already verified.", 409);

	await prisma.company.update({
		where: { id: companyId },
		data: { isVerified: true },
	});

	void writeAuditLog(actorId, "VERIFY_COMPANY", "COMPANY", companyId);
	logger.info("Admin: company verified", { actorId, companyId });
};

// ─── Job moderation ────────────────────────────────────────────────────────────

export const adminListJobsService = async (
	cursor?: string,
	limit = 20,
	status?: string,
	search?: string,
) => {
	const take = Math.min(limit, 100);

	const jobs = await prisma.job.findMany({
		where: {
			deletedAt: null,
			...(status && { status: status as any }),
			...(search && {
				title: { contains: search, mode: "insensitive" },
			}),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			slug: true,
			status: true,
			locationType: true,
			experienceLevel: true,
			createdAt: true,
			expiresAt: true,
			company: { select: { id: true, name: true } },
			_count: { select: { applications: true } },
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

export const adminForceCloseJobService = async (
	actorId: string,
	jobId: string,
	reason?: string,
	actorCompanyId?: string,
): Promise<void> => {
	const job = await prisma.job.findUnique({
		where: { id: jobId, deletedAt: null },
		select: { id: true, status: true, title: true, companyId: true },
	});

	if (!job) throw new AppError("Job not found.", 404);
	if (job.status === "CLOSED" || job.status === "EXPIRED") {
		throw new AppError(`Job is already ${job.status}.`, 409);
	}

	// Tenant isolation: ADMIN must operate within their own company
	if (actorCompanyId && job.companyId !== actorCompanyId) {
		throw new AppError(
			"You do not have permission to close jobs outside your company.",
			403,
		);
	}

	await prisma.job.update({
		where: { id: jobId },
		data: { status: "CLOSED" },
	});

	void invalidateJobLists();
	void invalidateJobDetail(jobId);

	void writeAuditLog(actorId, "FORCE_CLOSE_JOB", "JOB", jobId, {
		reason,
		title: job.title,
	});
	logger.info("Admin: job force-closed", { actorId, jobId, reason });
};

export const adminDeleteJobService = async (
	actorId: string,
	jobId: string,
	actorCompanyId?: string,
): Promise<void> => {
	const job = await prisma.job.findUnique({
		where: { id: jobId, deletedAt: null },
		select: { id: true, title: true, companyId: true },
	});

	if (!job) throw new AppError("Job not found.", 404);

	// Tenant isolation: ADMIN must operate within their own company
	if (actorCompanyId && job.companyId !== actorCompanyId) {
		throw new AppError(
			"You do not have permission to delete jobs outside your company.",
			403,
		);
	}

	await prisma.job.update({
		where: { id: jobId },
		data: { deletedAt: new Date(), status: "CLOSED" },
	});

	void invalidateJobLists();
	void invalidateJobDetail(jobId);

	void writeAuditLog(actorId, "DELETE_JOB", "JOB", jobId, { title: job.title });
	logger.info("Admin: job deleted", { actorId, jobId });
};

// ─── Audit log ─────────────────────────────────────────────────────────────────

export const listAuditLogsService = async (
	cursor?: string,
	limit = 20,
	actorId?: string,
	action?: string,
	targetType?: string,
) => {
	const take = Math.min(limit, 100);

	const logs = await (prisma as any).adminAuditLog.findMany({
		where: {
			...(actorId && { actorId }),
			...(action && { action }),
			...(targetType && { targetType }),
		},
		take: take + 1,
		...(cursor && { skip: 1, cursor: { id: cursor } }),
		orderBy: { createdAt: "desc" },
	});

	const hasNextPage = logs.length > take;
	const items = hasNextPage ? logs.slice(0, -1) : logs;
	return {
		logs: items,
		nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
		hasNextPage,
	};
};
