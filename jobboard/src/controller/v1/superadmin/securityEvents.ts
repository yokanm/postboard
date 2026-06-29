import type { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendPaginated } from "@/lib/response";
import { listSecurityEventsService } from "@/services/v1/security/security.service";

export const listSecurityEvents = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			cursor,
			limit,
			eventType,
			severity,
			startDate,
			endDate,
			companyId,
		} = req.query as Record<string, string | undefined>;

		const result = await listSecurityEventsService(
			companyId,
			cursor,
			limit ? parseInt(limit, 10) : 20,
			eventType,
			severity,
			startDate,
			endDate,
		);
		sendPaginated(res, result.events, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);
