import type { Request, Response } from "express";
import config from "@/config";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/response";
import {
	loginCompanyService,
	loginUserService,
} from "@/services/v1/auth/login.service";

const COOKIE_OPTS = (prod: boolean) => ({
	httpOnly: true,
	secure: prod,
	sameSite: "strict" as const,
	maxAge: 7 * 24 * 60 * 60 * 1000,
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
	const result = await loginUserService(req.body);
	res.cookie(
		"refreshToken",
		result.refreshToken,
		COOKIE_OPTS(config.NODE_ENV === "production"),
	);
	sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

const loginCompany = asyncHandler(async (req: Request, res: Response) => {
	const result = await loginCompanyService(req.body);
	res.cookie(
		"refreshToken",
		result.refreshToken,
		COOKIE_OPTS(config.NODE_ENV === "production"),
	);
	sendSuccess(res, {
		company: result.company,
		accessToken: result.accessToken,
	});
});

export { loginUser, loginCompany };
