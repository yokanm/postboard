import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendPaginated, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	inviteTeamMemberService,
	listTeamMembersService,
	removeTeamMemberService,
	transferTeamOwnershipService,
	updateTeamMemberRoleService,
} from "@/services/v1/company/team.service";

const listTeamMembers = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const { cursor, limit } = req.query as { cursor?: string; limit?: string };
		const result = await listTeamMembersService(
			req.companyId,
			cursor,
			limit ? parseInt(limit, 10) : 20,
		);
		sendPaginated(res, result.members, {
			nextCursor: result.nextCursor,
			hasNextPage: result.hasNextPage,
		});
	},
);

const inviteTeamMember = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const member = await inviteTeamMemberService(
			req.userId!,
			req.companyId,
			req.body,
		);
		sendSuccess(res, { member });
	},
);

const updateTeamMemberRole = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const member = await updateTeamMemberRoleService(
			req.companyId,
			req.userId!,
			req.params["memberId"] as string,
			req.body,
		);
		sendSuccess(res, { member });
	},
);

const removeTeamMember = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const ip = req.ip || req.socket.remoteAddress;
		const ua = req.headers["user-agent"];
		await removeTeamMemberService(
			req.companyId,
			req.userId!,
			req.params["memberId"] as string,
			ip,
			ua,
		);
		sendMessage(res, "Team member removed.");
	},
);

const transferTeamOwnership = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const ip = req.ip || req.socket.remoteAddress;
		const ua = req.headers["user-agent"];
		const result = await transferTeamOwnershipService(
			req.companyId,
			req.userId!,
			req.params["memberId"] as string,
			ip,
			ua,
		);
		sendSuccess(res, { message: "Company ownership transferred.", ...result });
	},
);

export {
	listTeamMembers,
	inviteTeamMember,
	updateTeamMemberRole,
	removeTeamMember,
	transferTeamOwnership,
};
