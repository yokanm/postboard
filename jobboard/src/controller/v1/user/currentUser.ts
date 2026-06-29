import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import {
	deleteUserAccountService,
	getCurrentUserService,
	updateUserService,
} from "@/services/v1/user/user.service";

const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
	const user = await getCurrentUserService(req.userId!);
	sendSuccess(res, { user });
});

const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
	const user = await updateUserService(req.userId!, req.body);
	sendSuccess(res, { user });
});

const deleteUserAccount = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await deleteUserAccountService(req.userId!, req.body.password);
		res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
		sendMessage(res, "Account deactivated successfully.");
	},
);

export { getCurrentUser, updateUser, deleteUserAccount };
