import type { Response } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { sendMessage, sendSuccess } from "@/lib/response";
import type { AuthRequest } from "@/middleware/authentication";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";
import {
	deleteCompanyLogoService,
	deleteCompanyService,
	getCompanyProfileService,
	updateCompanyProfileService,
	uploadCompanyLogoService,
} from "@/services/v1/company/company.service";

const getCompanyProfile = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with any company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const company = await getCompanyProfileService(req.companyId);
		sendSuccess(res, { company });
	},
);

const updateCompanyProfile = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const company = await updateCompanyProfileService(req.companyId, req.body);
		sendSuccess(res, { company });
	},
);

const uploadCompanyLogo = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.file) {
			throw new AppError("No file provided.", 422, ErrorCodes.VALIDATION_ERROR);
		}
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		const logoUrl = await uploadCompanyLogoService(
			req.companyId,
			req.file.buffer,
		);
		sendSuccess(res, { logoUrl });
	},
);

const deleteCompanyLogo = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		if (!req.companyId) {
			throw new AppError(
				"You are not associated with a company.",
				403,
				ErrorCodes.FORBIDDEN,
			);
		}
		await deleteCompanyLogoService(req.companyId);
		sendMessage(res, "Logo removed.");
	},
);

const deleteCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.companyId) {
		throw new AppError(
			"You are not associated with a company.",
			403,
			ErrorCodes.FORBIDDEN,
		);
	}
	if (!req.body.password) {
		throw new AppError(
			"Password is required.",
			422,
			ErrorCodes.VALIDATION_ERROR,
		);
	}
	await deleteCompanyService(req.companyId, req.body.password, req.userId);
	sendMessage(res, "Company deactivated.");
});

export {
	getCompanyProfile,
	updateCompanyProfile,
	uploadCompanyLogo,
	deleteCompanyLogo,
	deleteCompany,
};
