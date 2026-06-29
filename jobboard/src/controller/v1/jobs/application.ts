import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { prisma } from "@/lib/prisma";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	applyToJobService,
	getMyApplicationsService,
	listApplicationsService,
	updateApplicationStatusService,
	withdrawApplicationService,
} from "@/services/v1/jobs/application.service";

const getActor = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true },
	});
	if (!user) throw new AppError("User not found.", 404, ErrorCodes.NOT_FOUND);
	return user;
};

const applyToJob = asyncHandler(async (req: AuthRequest, res: Response) => {
	try {
		const application = await applyToJobService(
			req.params["id"] as string,
			req.userId!,
			{
				coverLetter: req.body.coverLetter,
				resumeUrl: req.body.resumeUrl,
				fileBuffer: req.file?.buffer,
			},
		);
		sendSuccess(res, { application }, 201);
	} catch (error: unknown) {
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		) {
			throw new AppError(
				"You have already applied to this job.",
				409,
				ErrorCodes.CONFLICT,
			);
		}
		throw error;
	}
});

const listApplications = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError("Forbidden.", 403, ErrorCodes.FORBIDDEN);
		}
		const actor = await getActor(req.userId);
		const result = await listApplicationsService(
			req.params["id"] as string,
			req.companyId,
			req.query as Record<string, string>,
			actor.id,
			actor.role,
		);
		sendPaginated(res, result.applications, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

const updateApplicationStatus = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError("Forbidden.", 403, ErrorCodes.FORBIDDEN);
		}
		const actor = await getActor(req.userId);
		const application = await updateApplicationStatusService(
			req.params["applicationId"] as string,
			req.companyId,
			req.body,
			actor.id,
			actor.role,
		);
		sendSuccess(res, { application });
	},
);

const getMyApplications = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { cursor, limit } = req.query as { cursor?: string; limit?: string };
		const result = await getMyApplicationsService(
			req.userId!,
			cursor,
			limit ? parseInt(limit, 10) : 20,
		);
		sendPaginated(res, result.applications, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

const withdrawApplication = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await withdrawApplicationService(
			req.params["applicationId"] as string,
			req.userId!,
		);
		sendMessage(res, "Application withdrawn.");
	},
);

export {
	applyToJob,
	listApplications,
	updateApplicationStatus,
	getMyApplications,
	withdrawApplication,
};
