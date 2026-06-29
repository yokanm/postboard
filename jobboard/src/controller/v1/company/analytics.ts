import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	assertCanViewCompanyAnalytics,
	assertCanViewRecruiterAnalytics,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	getCompanyAnalyticsService,
	getRecruiterAnalyticsService,
} from "@/services/v1/company/analytics.service";
import { getCompanyOwnershipService } from "@/services/v1/company/ownership.service";

const getActor = async (userId: string, companyId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true },
	});
	if (!user) throw new AppError("User not found.", 404, ErrorCodes.NOT_FOUND);
	return { id: user.id, role: user.role, companyId };
};

const getCompanyAnalytics = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const actor = await getActor(req.userId, req.companyId);
		const company = await getCompanyOwnershipService(req.companyId);
		assertCanViewCompanyAnalytics(actor, company);

		const analytics = await getCompanyAnalyticsService(req.companyId);
		sendSuccess(res, analytics);
	},
);

const getRecruiterAnalytics = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const targetUserId = req.params["id"] as string;
		const actor = await getActor(req.userId, req.companyId);
		const company = await getCompanyOwnershipService(req.companyId);
		assertCanViewRecruiterAnalytics(actor, targetUserId, company);

		const analytics = await getRecruiterAnalyticsService(
			req.companyId,
			targetUserId,
		);
		sendSuccess(res, analytics);
	},
);

export { getCompanyAnalytics, getRecruiterAnalytics };
