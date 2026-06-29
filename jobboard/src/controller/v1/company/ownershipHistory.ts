import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendPaginated } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import { listOwnershipHistoryService } from "@/services/v1/company/ownershipHistory.service";

const listOwnershipHistory = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const { cursor, limit } = req.query as { cursor?: string; limit?: string };
		const result = await listOwnershipHistoryService(
			req.companyId,
			cursor,
			limit ? parseInt(limit, 10) : 20,
		);
		sendPaginated(res, result.history, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export { listOwnershipHistory };
