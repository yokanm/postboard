import type { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import {
	changeUserPasswordService,
	forgotCompanyPasswordService,
	forgotUserPasswordService,
	resetCompanyPasswordService,
	resetUserPasswordService,
} from "@/services/v1/auth/passwordReset.service";

const ENUM_MSG = "If that email exists you will receive a reset link.";

const forgotUserPassword = asyncHandler(async (req: Request, res: Response) => {
	await forgotUserPasswordService(req.body.email);
	sendMessage(res, ENUM_MSG);
});

const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
	await resetUserPasswordService(
		req.query["token"] as string,
		req.body.password,
	);
	sendMessage(res, "Password reset successful. Please log in.");
});

const forgotCompanyPassword = asyncHandler(
	async (req: Request, res: Response) => {
		await forgotCompanyPasswordService(req.body.email);
		sendMessage(res, ENUM_MSG);
	},
);

const resetCompanyPassword = asyncHandler(
	async (req: Request, res: Response) => {
		await resetCompanyPasswordService(
			req.query["token"] as string,
			req.body.password,
		);
		sendMessage(res, "Password reset successful. Please log in.");
	},
);

const changeUserPassword = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		await changeUserPasswordService(
			req.userId!,
			req.body.currentPassword,
			req.body.newPassword,
		);
		res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
		sendMessage(res, "Password updated. Please log in again.");
	},
);

export {
	forgotUserPassword,
	resetUserPassword,
	forgotCompanyPassword,
	resetCompanyPassword,
	changeUserPassword,
};
