import type { Request, Response } from "express";
import config from "@/config";
import { asyncHandler } from "@/lib/asyncHandler";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokenHash";

const logout = asyncHandler(async (req: Request, res: Response) => {
	const token: string | undefined = req.cookies["refreshToken"];

	if (token) {
		await prisma.refreshToken.updateMany({
			where: { token: hashToken(token), isRevoked: false },
			data: { isRevoked: true },
		});
	}

	res.clearCookie("refreshToken", {
		httpOnly: true,
		sameSite: "strict",
		secure: config.NODE_ENV === "production",
	});

	res.sendStatus(204);
});

export { logout };
