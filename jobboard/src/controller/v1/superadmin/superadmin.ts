import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import config from "@/config";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	generateSuperAdminAccessToken,
	generateSuperAdminRefreshToken,
	verifySuperAdminRefreshToken,
} from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { sendMessage, sendSuccess } from "@/lib/response";
import { hashToken } from "@/lib/tokenHash";
import logger from "@/lib/winston";
import { AppError, ErrorCodes } from "@/middleware/errorHandler";

const writeAuditLog = async (
	actorId: string,
	action: string,
	targetType: string,
	targetId: string,
	metadata?: Record<string, unknown>,
): Promise<void> => {
	try {
		await (prisma as any).adminAuditLog.create({
			data: {
				id: nanoid(),
				actorId,
				action,
				targetType,
				targetId,
				metadata: metadata ?? {},
			},
		});
	} catch (error) {
		logger.error("Audit log write failed", error);
	}
};

export const seedSuperAdmin = async (): Promise<void> => {
	const email = process.env["SUPER_ADMIN_EMAIL"];
	const password = process.env["SUPER_ADMIN_PASSWORD"];
	const firstName = process.env["SUPER_ADMIN_FIRST_NAME"] ?? "Super";
	const lastName = process.env["SUPER_ADMIN_LAST_NAME"] ?? "Admin";

	if (!email || !password) {
		throw new Error(
			"SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env",
		);
	}

	const existing = await prisma.superAdmin.findUnique({ where: { email } });
	if (existing) {
		console.log("Super admin already exists — skipping seed");
		return;
	}

	await prisma.superAdmin.create({
		data: {
			email,
			password: await hashPassword(password),
			firstName,
			lastName,
		},
	});

	console.log(`Super admin created: ${email}`);
};

export const loginSuperAdmin = asyncHandler(
	async (req: Request, res: Response) => {
		const { email, password } = req.body as { email: string; password: string };

		const admin = await prisma.superAdmin.findUnique({ where: { email } });

		if (!admin || !(await verifyPassword(password, admin.password))) {
			throw new AppError("Invalid credentials", 401, ErrorCodes.UNAUTHORIZED);
		}

		const accessToken = generateSuperAdminAccessToken(admin.id);
		const refreshToken = generateSuperAdminRefreshToken(admin.id);

		const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await prisma.superAdminRefreshToken.create({
			data: {
				token: hashToken(refreshToken),
				superAdminId: admin.id,
				expiresAt: sevenDays,
			},
		});

		res.cookie("superAdminRefreshToken", refreshToken, {
			httpOnly: true,
			secure: config.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		const { password: _pwd, ...adminSafe } = admin;

		sendSuccess(res, {
			message: "Login successful",
			accessToken,
			admin: adminSafe,
		});
	},
);

export const getPlatformStats = asyncHandler(
	async (_req: Request, res: Response) => {
		const [
			totalCompanies,
			verifiedCompanies,
			totalUsers,
			totalCandidates,
			totalRecruiters,
			totalJobs,
			openJobs,
			totalApplications,
		] = await Promise.all([
			prisma.company.count({ where: { deletedAt: null } }),
			prisma.company.count({ where: { isVerified: true, deletedAt: null } }),
			prisma.user.count({ where: { deletedAt: null } }),
			prisma.user.count({ where: { role: "CANDIDATE", deletedAt: null } }),
			prisma.user.count({ where: { role: "RECRUITER", deletedAt: null } }),
			prisma.job.count({ where: { deletedAt: null } }),
			prisma.job.count({ where: { status: "OPEN", deletedAt: null } }),
			prisma.jobApplication.count(),
		]);

		sendSuccess(res, {
			companies: { total: totalCompanies, verified: verifiedCompanies },
			users: {
				total: totalUsers,
				candidates: totalCandidates,
				recruiters: totalRecruiters,
			},
			jobs: { total: totalJobs, open: openJobs },
			applications: { total: totalApplications },
		});
	},
);

export const listAllCompanies = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			cursor,
			limit = "20",
			isVerified,
			search,
		} = req.query as Record<string, string>;
		const take = Math.min(Number(limit), 100);

		const where: Record<string, unknown> = { deletedAt: null };
		if (isVerified !== undefined) where["isVerified"] = isVerified === "true";
		if (search) {
			where["OR"] = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			];
		}

		const companies = await prisma.company.findMany({
			where,
			take: take + 1,
			orderBy: { createdAt: "desc" },
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: { _count: { select: { jobs: true, users: true } } },
		});

		const hasNextPage = companies.length > take;
		const items = hasNextPage ? companies.slice(0, take) : companies;
		const nextCursor = hasNextPage ? items[items.length - 1].id : null;

		const safe = items.map(({ password: _p, ...c }) => c);

		sendSuccess(res, {
			data: safe,
			meta: { nextCursor, hasNextPage },
		});
	},
);

export const setCompanyVerification = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const { isVerified } = req.body as { isVerified: boolean };
		const actorId = req.userId!;

		const company = await prisma.company.findUnique({ where: { id } });
		if (!company) {
			throw new AppError("Company not found", 404, ErrorCodes.NOT_FOUND);
		}

		const updated = await prisma.company.update({
			where: { id },
			data: { isVerified },
		});
		const { password: _p, ...safe } = updated;

		void writeAuditLog(
			actorId,
			isVerified ? "VERIFY_COMPANY" : "UNVERIFY_COMPANY",
			"COMPANY",
			id,
			{ name: company.name },
		);

		sendSuccess(res, {
			message: `Company ${isVerified ? "verified" : "unverified"} successfully`,
			company: safe,
		});
	},
);

export const deleteCompany = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const actorId = req.userId!;

		const company = await prisma.company.findUnique({ where: { id } });
		if (!company) {
			throw new AppError("Company not found", 404, ErrorCodes.NOT_FOUND);
		}

		await prisma.$transaction([
			prisma.company.update({ where: { id }, data: { deletedAt: new Date() } }),
			prisma.job.updateMany({
				where: { companyId: id },
				data: { deletedAt: new Date(), status: "CLOSED" },
			}),
			prisma.user.updateMany({
				where: { companyId: id },
				data: { deletedAt: new Date() },
			}),
		]);

		void writeAuditLog(actorId, "DELETE_COMPANY", "COMPANY", id, {
			name: company.name,
		});
		logger.info("SuperAdmin: company deleted", { actorId, companyId: id });

		sendMessage(res, "Company and all related records deactivated");
	},
);

export const listAllJobs = asyncHandler(async (req: Request, res: Response) => {
	const {
		cursor,
		limit = "20",
		status,
		companyId,
	} = req.query as Record<string, string>;
	const take = Math.min(Number(limit), 100);

	const where: Record<string, unknown> = { deletedAt: null };
	if (status) where["status"] = status;
	if (companyId) where["companyId"] = companyId;

	const jobs = await prisma.job.findMany({
		where,
		take: take + 1,
		orderBy: { createdAt: "desc" },
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		include: {
			company: { select: { name: true, slug: true } },
			_count: { select: { applications: true } },
		},
	});

	const hasNextPage = jobs.length > take;
	const items = hasNextPage ? jobs.slice(0, take) : jobs;
	const nextCursor = hasNextPage ? items[items.length - 1].id : null;

	sendSuccess(res, {
		data: items,
		meta: { nextCursor, hasNextPage },
	});
});

export const forceCloseJob = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const actorId = req.userId!;

		const job = await prisma.job.findUnique({ where: { id } });
		if (!job) {
			throw new AppError("Job not found", 404, ErrorCodes.NOT_FOUND);
		}

		await prisma.job.update({
			where: { id },
			data: { status: "CLOSED", deletedAt: new Date() },
		});

		void writeAuditLog(actorId, "FORCE_CLOSE_JOB", "JOB", id, {
			title: job.title,
		});
		logger.info("SuperAdmin: job force-closed", { actorId, jobId: id });

		sendMessage(res, "Job forcefully closed");
	},
);

export const listAllCandidates = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			cursor,
			limit = "20",
			search,
		} = req.query as Record<string, string>;
		const take = Math.min(Number(limit), 100);

		const where: Record<string, unknown> = {
			role: "CANDIDATE",
			deletedAt: null,
		};
		if (search) {
			where["OR"] = [
				{ email: { contains: search, mode: "insensitive" } },
				{ firstName: { contains: search, mode: "insensitive" } },
				{ lastName: { contains: search, mode: "insensitive" } },
			];
		}

		const candidates = await prisma.user.findMany({
			where,
			take: take + 1,
			orderBy: { createdAt: "desc" },
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: {
				profile: { select: { skills: true, location: true } },
				_count: { select: { applications: true } },
			},
		});

		const hasNextPage = candidates.length > take;
		const items = hasNextPage ? candidates.slice(0, take) : candidates;
		const nextCursor = hasNextPage ? items[items.length - 1].id : null;

		const safe = items.map(({ password: _p, ...u }) => u);

		sendSuccess(res, {
			data: safe,
			meta: { nextCursor, hasNextPage },
		});
	},
);

export const banCandidate = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params as { id: string };
		const actorId = req.userId!;

		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true, role: true, deletedAt: true, email: true },
		});

		if (!user || user.deletedAt) {
			throw new AppError(
				"Candidate not found or already deactivated",
				404,
				ErrorCodes.NOT_FOUND,
			);
		}

		if (user.role !== "CANDIDATE") {
			throw new AppError(
				"This endpoint only bans candidates",
				400,
				ErrorCodes.VALIDATION_ERROR,
			);
		}

		await prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		void writeAuditLog(actorId, "BAN_CANDIDATE", "USER", id, {
			email: user.email,
		});
		logger.info("SuperAdmin: candidate banned", { actorId, targetId: id });

		sendMessage(res, "Candidate account deactivated");
	},
);

export const refreshSuperAdminToken = asyncHandler(
	async (req: Request, res: Response) => {
		const token: string | undefined = req.cookies["superAdminRefreshToken"];

		if (!token) {
			throw new AppError(
				"Refresh token not found",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		let payload: { sub: string; type: string };
		try {
			payload = verifySuperAdminRefreshToken(token);
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError) {
				throw new AppError(
					"Refresh token expired",
					401,
					ErrorCodes.UNAUTHORIZED,
				);
			}
			throw new AppError("Invalid refresh token", 401, ErrorCodes.UNAUTHORIZED);
		}

		if (payload.type !== "superadmin") {
			throw new AppError("Invalid token type", 401, ErrorCodes.UNAUTHORIZED);
		}

		const tokenHash = hashToken(token);
		const stored = await prisma.superAdminRefreshToken.findUnique({
			where: { token: tokenHash },
		});

		if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
			throw new AppError(
				"Refresh token is no longer valid or has expired",
				401,
				ErrorCodes.UNAUTHORIZED,
			);
		}

		await prisma.superAdminRefreshToken.update({
			where: { id: stored.id },
			data: { isRevoked: true },
		});

		const newAccessToken = generateSuperAdminAccessToken(payload.sub);
		const newRefreshToken = generateSuperAdminRefreshToken(payload.sub);
		const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await prisma.superAdminRefreshToken.create({
			data: {
				token: hashToken(newRefreshToken),
				superAdminId: stored.superAdminId,
				expiresAt: sevenDays,
			},
		});

		res.cookie("superAdminRefreshToken", newRefreshToken, {
			httpOnly: true,
			secure: config.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendSuccess(res, { accessToken: newAccessToken });
	},
);

export const logoutSuperAdmin = asyncHandler(
	async (req: Request, res: Response) => {
		const token: string | undefined = req.cookies["superAdminRefreshToken"];

		if (token) {
			await prisma.superAdminRefreshToken.updateMany({
				where: { token: hashToken(token), isRevoked: false },
				data: { isRevoked: true },
			});
		}

		res.clearCookie("superAdminRefreshToken", {
			httpOnly: true,
			sameSite: "strict",
			secure: config.NODE_ENV === "production",
		});

		res.sendStatus(204);
	},
);
