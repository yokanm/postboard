import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import {
	adminDeactivateUserService,
	adminDeleteJobService,
	adminForceCloseJobService,
	adminListCompaniesService,
	adminListJobsService,
	adminListUsersService,
	adminVerifyCompanyService,
	getPlatformStatsService,
	listAuditLogsService,
} from "@/services/v1/admin/admin.service";

export const getPlatformStats = asyncHandler(
	async (_req: AuthRequest, res: Response) => {
		const stats = await getPlatformStatsService();
		sendSuccess(res, stats);
	},
);

export const adminListUsers = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { cursor, limit, role, search } = req.query as Record<string, string>;
		const result = await adminListUsersService(
			cursor,
			limit ? parseInt(limit, 10) : 20,
			role,
			search,
		);
		sendPaginated(res, result.users, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const adminDeactivateUser = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await adminDeactivateUserService(
			req.userId!,
			req.params["userId"] as string,
			req.companyId,
		);
		sendMessage(res, "User deactivated.");
	},
);

export const adminListCompanies = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { cursor, limit, search, verified } = req.query as Record<
			string,
			string
		>;
		const result = await adminListCompaniesService(
			cursor,
			limit ? parseInt(limit, 10) : 20,
			search,
			verified,
		);
		sendPaginated(res, result.companies, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const adminVerifyCompany = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await adminVerifyCompanyService(
			req.userId!,
			req.params["companyId"] as string,
			req.companyId,
		);
		sendMessage(res, "Company verified.");
	},
);

export const adminListJobs = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { cursor, limit, status, search } = req.query as Record<
			string,
			string
		>;
		const result = await adminListJobsService(
			cursor,
			limit ? parseInt(limit, 10) : 20,
			status,
			search,
		);
		sendPaginated(res, result.jobs, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const adminForceCloseJob = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await adminForceCloseJobService(
			req.userId!,
			req.params["jobId"] as string,
			req.body.reason,
			req.companyId,
		);
		sendMessage(res, "Job closed.");
	},
);

export const adminDeleteJob = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await adminDeleteJobService(
			req.userId!,
			req.params["jobId"] as string,
			req.companyId,
		);
		sendMessage(res, "Job deleted.");
	},
);

export const listAuditLogs = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { cursor, limit, actorId, action, targetType } = req.query as Record<
			string,
			string
		>;
		const result = await listAuditLogsService(
			cursor,
			limit ? parseInt(limit, 10) : 20,
			actorId,
			action,
			targetType,
		);
		sendPaginated(res, result.logs, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);
