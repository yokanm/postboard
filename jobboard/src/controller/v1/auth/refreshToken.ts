import type { Request, Response } from "express";
import config from "@/config";
import { parseTtlMs } from "@/lib";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendSuccess } from "@/lib/response";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import { refreshTokenService } from "@/services/v1/auth/refreshToken.service";

const REFRESH_COOKIE_MAX_AGE = parseTtlMs(config.REFRESH_TOKEN_EXPIRES);

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
	const token = req.cookies.refreshToken as string | undefined;
	if (!token) {
		throw new AppError("Refresh token not found", 401, ErrorCodes.UNAUTHORIZED);
	}

	const result = await refreshTokenService(token);

	res.cookie("refreshToken", result.refreshToken, {
		httpOnly: true,
		secure: config.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: REFRESH_COOKIE_MAX_AGE,
	});

	sendSuccess(res, { accessToken: result.accessToken });
});

export default refreshToken;
