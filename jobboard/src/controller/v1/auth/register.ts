import type { Request, Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendSuccess } from "@/lib/response";
import {
	registerCompanyService,
	registerUserService,
} from "@/services/v1/auth/register.service";

const registerUsers = asyncHandler(async (req: Request, res: Response) => {
	const result = await registerUserService(req.body);
	sendSuccess(
		res,
		{
			user: result.user,
			message:
				"Verification email sent. Please verify your email before logging in.",
		},
		201,
	);
});

const registerCompany = asyncHandler(async (req: Request, res: Response) => {
	const result = await registerCompanyService(req.body);
	sendSuccess(
		res,
		{
			message: "Company and admin user created successfully",
			companyId: result.companyId,
			userId: result.userId,
		},
		201,
	);
});

export { registerUsers, registerCompany };
