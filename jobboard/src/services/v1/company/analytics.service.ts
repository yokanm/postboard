import { prisma } from "@/lib/prisma";

export const getCompanyAnalyticsService = async (companyId: string) => {
	const [
		totalJobs,
		activeJobs,
		draftJobs,
		closedJobs,
		expiredJobs,
		totalApplications,
		statusCounts,
		jobsWithApplicationCount,
		recruiterJobCounts,
	] = await Promise.all([
		prisma.job.count({ where: { companyId, deletedAt: null } }),
		prisma.job.count({ where: { companyId, status: "OPEN", deletedAt: null } }),
		prisma.job.count({
			where: { companyId, status: "DRAFT", deletedAt: null },
		}),
		prisma.job.count({
			where: { companyId, status: "CLOSED", deletedAt: null },
		}),
		prisma.job.count({
			where: { companyId, status: "EXPIRED", deletedAt: null },
		}),
		prisma.jobApplication.count({
			where: { job: { companyId, deletedAt: null } },
		}),
		prisma.jobApplication.groupBy({
			by: ["status"],
			where: { job: { companyId, deletedAt: null } },
			_count: true,
		}),
		prisma.job.findMany({
			where: { companyId, deletedAt: null },
			select: {
				id: true,
				title: true,
				_count: { select: { applications: true } },
			},
			orderBy: { createdAt: "desc" },
			take: 100,
		}),
		prisma.user.findMany({
			where: { companyId, role: "RECRUITER", deletedAt: null },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				_count: {
					select: {
						postedJobs: { where: { deletedAt: null } },
					},
				},
			},
		}),
	]);

	const applicationStatusMap: Record<string, number> = {};
	for (const s of statusCounts) {
		applicationStatusMap[s.status] = s._count;
	}

	const pendingCount = applicationStatusMap["PENDING"] ?? 0;
	const reviewedCount = applicationStatusMap["REVIEWED"] ?? 0;
	const shortlistedCount = applicationStatusMap["SHORTLISTED"] ?? 0;
	const acceptedCount = applicationStatusMap["ACCEPTED"] ?? 0;
	const rejectedCount = applicationStatusMap["REJECTED"] ?? 0;

	return {
		jobs: {
			total: totalJobs,
			active: activeJobs,
			draft: draftJobs,
			closed: closedJobs,
			expired: expiredJobs,
		},
		applications: {
			total: totalApplications,
			pending: pendingCount,
			reviewed: reviewedCount,
			shortlisted: shortlistedCount,
			accepted: acceptedCount,
			rejected: rejectedCount,
		},
		conversionRates: {
			applicationToInterview:
				totalApplications > 0
					? Math.round((shortlistedCount / totalApplications) * 100)
					: 0,
			interviewToOffer:
				shortlistedCount > 0
					? Math.round((acceptedCount / shortlistedCount) * 100)
					: 0,
		},
		applicationsPerJob: jobsWithApplicationCount.map((j) => ({
			jobId: j.id,
			title: j.title,
			applications: j._count.applications,
		})),
		recruiterActivity: recruiterJobCounts.map((r) => ({
			recruiterId: r.id,
			name: `${r.firstName} ${r.lastName}`,
			jobsPosted: r._count.postedJobs,
		})),
	};
};

export const getRecruiterAnalyticsService = async (
	companyId: string,
	targetUserId: string,
) => {
	const [jobsCreated, publishedJobs, applicationStats, recentApplications] =
		await Promise.all([
			prisma.job.count({
				where: { postedById: targetUserId, companyId, deletedAt: null },
			}),
			prisma.job.count({
				where: {
					postedById: targetUserId,
					companyId,
					status: "OPEN",
					deletedAt: null,
				},
			}),
			prisma.jobApplication.groupBy({
				by: ["status"],
				where: {
					job: { postedById: targetUserId, companyId, deletedAt: null },
				},
				_count: true,
			}),
			prisma.jobApplication.findMany({
				where: {
					job: { postedById: targetUserId, companyId, deletedAt: null },
				},
				orderBy: { updatedAt: "desc" },
				take: 20,
				select: {
					id: true,
					status: true,
					updatedAt: true,
					job: { select: { id: true, title: true } },
					user: { select: { id: true, firstName: true, lastName: true } },
				},
			}),
		]);

	const statsMap: Record<string, number> = {};
	for (const s of applicationStats) {
		statsMap[s.status] = s._count;
	}

	const pendingCount = statsMap["PENDING"] ?? 0;
	const reviewedCount = statsMap["REVIEWED"] ?? 0;
	const shortlistedCount = statsMap["SHORTLISTED"] ?? 0;
	const acceptedCount = statsMap["ACCEPTED"] ?? 0;
	const rejectedCount = statsMap["REJECTED"] ?? 0;

	const totalHandled =
		pendingCount +
		reviewedCount +
		shortlistedCount +
		acceptedCount +
		rejectedCount;

	return {
		jobsCreated,
		jobsPublished,
		applications: {
			total: totalHandled,
			pending: pendingCount,
			reviewed: reviewedCount,
			shortlisted: shortlistedCount,
			accepted: acceptedCount,
			rejected: rejectedCount,
		},
		recentActivity: recentApplications.map((a) => ({
			applicationId: a.id,
			status: a.status,
			jobTitle: a.job.title,
			candidateName: `${a.user.firstName} ${a.user.lastName}`,
			updatedAt: a.updatedAt,
		})),
	};
};
