import type { Request, Response } from "express";
import config from "@/config";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage } from "@/lib/response";
import {
	sendCompanyVerificationEmailService,
	sendUserVerificationEmailService,
	verifyCompanyEmailService,
	verifyUserEmailService,
} from "@/services/v1/auth/emailVerification.service";

const sendUserVerificationEmail = asyncHandler(
	async (req: Request, res: Response) => {
		await sendUserVerificationEmailService(req.body.email);
		sendMessage(
			res,
			"If that email is registered you will receive a verification link.",
		);
	},
);

const verifyUserEmail = asyncHandler(async (req: Request, res: Response) => {
	await verifyUserEmailService(req.query["token"] as string);

	// Browser navigation → redirect to frontend; API call → return JSON
	if (req.accepts("html")) {
		return res.redirect(302, `${config.FRONTEND_URL}/login?verified=true`);
	}
	sendMessage(res, "Email verified successfully.");
});

const sendCompanyVerificationEmail = asyncHandler(
	async (req: Request, res: Response) => {
		await sendCompanyVerificationEmailService(req.body.email);
		sendMessage(
			res,
			"If that email is registered you will receive a verification link.",
		);
	},
);

const verifyCompanyEmail = asyncHandler(async (req: Request, res: Response) => {
	await verifyCompanyEmailService(req.query["token"] as string);

	if (req.accepts("html")) {
		return res.redirect(302, `${config.FRONTEND_URL}/login?verified=true`);
	}
	sendMessage(res, "Company email verified successfully.");
});

export {
	sendUserVerificationEmail,
	verifyUserEmail,
	sendCompanyVerificationEmail,
	verifyCompanyEmail,
};
