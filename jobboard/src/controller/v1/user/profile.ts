import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	deleteResumeService,
	getProfileService,
	uploadResumeService,
	upsertProfileService,
} from "@/services/v1/user/profile.service";

const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
	const profile = await getProfileService(req.userId!);
	sendSuccess(res, { profile });
});

const upsertProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
	const profile = await upsertProfileService(req.userId!, req.body);
	sendSuccess(res, { profile });
});

const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.file) {
		throw new AppError(
			"No file provided. Upload a PDF.",
			422,
			ErrorCodes.VALIDATION_ERROR,
		);
	}
	const resumeUrl = await uploadResumeService(req.userId!, req.file.buffer);
	sendSuccess(res, { resumeUrl });
});

const deleteResume = asyncHandler(async (req: AuthRequest, res: Response) => {
	await deleteResumeService(req.userId!);
	sendMessage(res, "Resume removed.");
});

export { getProfile, upsertProfile, uploadResume, deleteResume };
