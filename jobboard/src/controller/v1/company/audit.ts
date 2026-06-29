import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { assertCanViewCompanyAuditLogs } from "@/lib/permissions";
import { sendPaginated } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import { listCompanyAuditLogsService } from "@/services/v1/company/audit.service";
import { getCompanyOwnershipService } from "@/services/v1/company/ownership.service";

const listCompanyAuditLogs = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId || !req.userId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}

		const company = await getCompanyOwnershipService(req.companyId);
		assertCanViewCompanyAuditLogs(
			{ id: req.userId, role: "ADMIN", companyId: req.companyId },
			company,
		);

		const { cursor, limit, action, startDate, endDate } = req.query as Record<
			string,
			string
		>;
		const result = await listCompanyAuditLogsService({
			companyId: req.companyId,
			cursor,
			limit: limit ? parseInt(limit, 10) : 20,
			action,
			startDate,
			endDate,
		});

		sendPaginated(res, result.logs, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

export { listCompanyAuditLogs };
