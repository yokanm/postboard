import type { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import { getOwnerlessCompaniesService } from "@/services/v1/company/ownershipHistory.service";
import {
	assignCompanyOwnerService,
	recoverOwnerlessCompanyService,
} from "@/services/v1/superadmin/recovery.service";

export const listOwnerlessCompanies = asyncHandler(
	async (req: Request, res: Response) => {
		const { cursor, limit } = req.query as { cursor?: string; limit?: string };
		const result = await getOwnerlessCompaniesService(
			cursor,
			limit ? parseInt(limit, 10) : 20,
		);
		sendPaginated(res, result.companies, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export const assignCompanyOwner = asyncHandler(
	async (req: Request, res: Response) => {
		const superAdminId = (req as AuthRequest).userId || "unknown";
		const { id: companyId } = req.params as { id: string };
		const { newOwnerId, reason } = req.body as {
			newOwnerId: string;
			reason?: string;
		};
		const ip = req.ip || req.socket.remoteAddress;
		const ua = req.headers["user-agent"];

		if (!newOwnerId) {
			throw new AppError(
				"newOwnerId is required.",
				422,
				ErrorCodes.VALIDATION_ERROR,
			);
		}

		const result = await assignCompanyOwnerService(
			superAdminId,
			companyId,
			newOwnerId,
			reason,
			ip,
			ua,
		);
		sendSuccess(res, result);
	},
);

export const recoverOwnerlessCompany = asyncHandler(
	async (req: Request, res: Response) => {
		const superAdminId = (req as AuthRequest).userId || "unknown";
		const { id: companyId } = req.params as { id: string };
		const ip = req.ip || req.socket.remoteAddress;
		const ua = req.headers["user-agent"];

		const result = await recoverOwnerlessCompanyService(
			superAdminId,
			companyId,
			ip,
			ua,
		);
		sendSuccess(res, {
			message: "Company ownership recovered.",
			newOwnerId: result.newOwnerId,
		});
	},
);
