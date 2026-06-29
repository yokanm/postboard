import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { prisma } from "@/lib/prisma";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	createJobService,
	deleteJobService,
	getJobService,
	listJobsService,
	updateJobService,
	updateJobStatusService,
} from "@/services/v1/jobs/job.service.cached";

const getActor = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true },
	});
	if (!user) throw new AppError("User not found.", 404, ErrorCodes.NOT_FOUND);
	return user;
};

const createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.companyId || !req.userId) {
		throw new AppError(
			"Forbidden: company context missing.",
			403,
			ErrorCodes.FORBIDDEN,
		);
	}
	const job = await createJobService(req.companyId, req.userId, req.body);
	sendSuccess(res, { job }, 201);
});

const listJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
	const result = await listJobsService(req.query as Record<string, string>);
	sendPaginated(res, result.jobs, {
		nextCursor: result.nextCursor,
		hasNextPage: result.hasNextPage,
	});
});

const getJob = asyncHandler(async (req: AuthRequest, res: Response) => {
	const job = await getJobService(req.params["id"] as string);
	sendSuccess(res, { job });
});

const updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.companyId || !req.userId) {
		throw new AppError(
			"Forbidden: company context missing.",
			403,
			ErrorCodes.FORBIDDEN,
		);
	}
	const actor = await getActor(req.userId);
	const job = await updateJobService(
		req.params["id"] as string,
		req.companyId,
		req.body,
		actor.id,
		actor.role,
	);
	sendSuccess(res, { job });
});

const updateJobStatus = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError(
				"Forbidden: company context missing.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const actor = await getActor(req.userId);
		const job = await updateJobStatusService(
			req.params["id"] as string,
			req.companyId,
			req.body,
			actor.id,
			actor.role,
		);
		sendSuccess(res, { job });
	},
);

const deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.companyId || !req.userId) {
		throw new AppError(
			"Forbidden: company context missing.",
			403,
			ErrorCodes.FORBIDDEN,
		);
	}
	await deleteJobService(req.params["id"] as string, req.userId, req.companyId);
	sendMessage(res, "Job deleted.");
});

export { createJob, listJobs, getJob, updateJob, updateJobStatus, deleteJob };
