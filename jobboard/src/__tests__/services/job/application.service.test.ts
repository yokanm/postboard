// src/__tests__/services/job/application.service.test.ts
//
// Unit tests for the job application service.
// Covers all exported functions: applyToJobService, listApplicationsService,
// updateApplicationStatusService, getMyApplicationsService, withdrawApplicationService.
//
// Prisma, queues, notifications, and cloudinary are all mocked in setup.ts.

import { beforeEach, describe, expect, it, type jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	applyToJobService,
	getMyApplicationsService,
	listApplicationsService,
	updateApplicationStatusService,
	withdrawApplicationService,
} from "@/services/v1/jobs/application.service";

const mockJob = prisma.job as jest.Mocked<typeof prisma.job>;
const mockApp = prisma.jobApplication as jest.Mocked<
	typeof prisma.jobApplication
>;
const mockUserProfile = prisma.userProfile as jest.Mocked<
	typeof prisma.userProfile
>;
const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;

// ── Shared fixtures ────────────────────────────────────────────────────────────

const openJob = {
	id: "job-1",
	status: "OPEN" as const,
	companyId: "company-1",
	title: "Engineer",
	slug: "engineer-job-1",
	description: "Job description",
	location: null,
	locationType: "REMOTE" as const,
	experienceLevel: "MID" as const,
	salaryMin: null,
	salaryMax: null,
	currency: "USD",
	expiresAt: null,
	deletedAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	postedById: "user-1",
};

const fakeApplication = {
	id: "app-1",
	jobId: "job-1",
	userId: "user-1",
	coverLetter: "I am great",
	resumeUrl: null,
	status: "PENDING" as const,
	rejectionReason: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	job: { id: "job-1", title: "Engineer", companyId: "company-1" },
	user: {
		id: "user-1",
		firstName: "Ada",
		lastName: "Okafor",
		email: "ada@example.com",
	},
};

const mockRecruiter = {
	id: "recruiter-1",
	userName: "recruiter_one",
	firstName: "Recruiter",
	lastName: "One",
	email: "recruiter@acme.com",
	password: "hashed_password",
	role: "ADMIN" as const,
	companyId: "company-1",
	isVerified: true,
	phone: null,
	deletedAt: null,
	emailVerifyToken: null,
	emailVerifyExpiresAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	passwordResetToken: null,
	passwordResetExpiresAt: null,
};

// ─── applyToJobService ────────────────────────────────────────────────────────

describe("applyToJobService", () => {
	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue(openJob as any);
		mockUserProfile.findUnique.mockResolvedValue(null);
		mockApp.create.mockResolvedValue(fakeApplication as any);
		mockUser.findFirst.mockResolvedValue(mockRecruiter as any);
	});

	it("creates and returns an application", async () => {
		const result = await applyToJobService("job-1", "user-1", {
			coverLetter: "I am great",
		});
		expect(result).toMatchObject({ id: "app-1", status: "PENDING" });
		expect(mockApp.create).toHaveBeenCalledTimes(1);
	});

	it("stores the provided coverLetter (trimmed)", async () => {
		await applyToJobService("job-1", "user-1", {
			coverLetter: "  My letter  ",
		});
		expect(mockApp.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ coverLetter: "My letter" }),
			}),
		);
	});

	it("throws 404 when job does not exist", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(applyToJobService("bad-job", "user-1", {})).rejects.toThrow(
			new AppError("Job not found.", 404),
		);
	});

	it("throws 422 when job is not OPEN", async () => {
		mockJob.findUnique.mockResolvedValue({
			...openJob,
			status: "CLOSED",
		} as any);
		await expect(applyToJobService("job-1", "user-1", {})).rejects.toThrow(
			new AppError("This job is not currently accepting applications.", 422),
		);
	});

	it("throws 422 when job is DRAFT", async () => {
		mockJob.findUnique.mockResolvedValue({
			...openJob,
			status: "DRAFT",
		} as any);
		await expect(applyToJobService("job-1", "user-1", {})).rejects.toThrow(
			new AppError("This job is not currently accepting applications.", 422),
		);
	});

	it("falls back to profile resumeUrl when no file or body URL given", async () => {
		mockUserProfile.findUnique.mockResolvedValue({
			id: "profile-1",
			userId: "user-1",
			resumeUrl: "https://cdn.example.com/resume.pdf",
			resumePublicId: null,
			bio: null,
			linkedinUrl: null,
			githubUrl: null,
			skills: [] as string[],
			location: null,
			updatedAt: new Date(),
		} as any);

		await applyToJobService("job-1", "user-1", {});
		expect(mockApp.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					resumeUrl: "https://cdn.example.com/resume.pdf",
				}),
			}),
		);
	});

	it("uses null resumeUrl when no file, body URL, or profile URL exists", async () => {
		mockUserProfile.findUnique.mockResolvedValue(null);
		await applyToJobService("job-1", "user-1", {});
		expect(mockApp.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ resumeUrl: null }),
			}),
		);
	});

	it("stores the job and user IDs on the record", async () => {
		await applyToJobService("job-1", "user-1", {});
		expect(mockApp.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ jobId: "job-1", userId: "user-1" }),
			}),
		);
	});
});

// ─── listApplicationsService ──────────────────────────────────────────────────

describe("listApplicationsService", () => {
	const appWithUser = {
		...fakeApplication,
		user: {
			id: "user-1",
			userName: "ada",
			firstName: "Ada",
			lastName: "Okafor",
			email: "ada@example.com",
			profile: { resumeUrl: null, skills: [], location: null },
		},
	};

	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue({ companyId: "company-1" } as any);
		mockApp.findMany.mockResolvedValue([appWithUser] as any);
	});

	it("returns applications for a job the company owns", async () => {
		const result = await listApplicationsService("job-1", "company-1", {});
		expect(result.applications).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("throws 404 when job does not exist", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(
			listApplicationsService("bad-job", "company-1", {}),
		).rejects.toThrow(new AppError("Job not found.", 404));
	});

	it("throws 403 when company does not own the job", async () => {
		mockJob.findUnique.mockResolvedValue({ companyId: "other-company" } as any);
		await expect(
			listApplicationsService("job-1", "company-1", {}),
		).rejects.toThrow(new AppError("You do not own this job.", 403));
	});

	it("filters by status when provided", async () => {
		await listApplicationsService("job-1", "company-1", { status: "REVIEWED" });
		expect(mockApp.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ status: "REVIEWED" }),
			}),
		);
	});

	it("paginates when results exceed limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...appWithUser,
			id: `app-${i}`,
		}));
		mockApp.findMany.mockResolvedValue(many as any);
		const result = await listApplicationsService("job-1", "company-1", {
			limit: "20",
		});
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("app-19");
		expect(result.applications).toHaveLength(20);
	});

	it("passes cursor for keyset pagination", async () => {
		await listApplicationsService("job-1", "company-1", { cursor: "app-5" });
		expect(mockApp.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ cursor: { id: "app-5" }, skip: 1 }),
		);
	});
});

// ─── updateApplicationStatusService ───────────────────────────────────────────

describe("updateApplicationStatusService", () => {
	const pendingApp = {
		...fakeApplication,
		job: { companyId: "company-1", title: "Engineer" },
		user: {
			id: "user-1",
			firstName: "Ada",
			lastName: "Okafor",
			email: "ada@example.com",
		},
	};

	beforeEach(() => {
		mockApp.findUnique.mockResolvedValue(pendingApp as any);
		mockApp.update.mockResolvedValue({
			...fakeApplication,
			status: "REVIEWED",
		} as any);
	});

	it("allows valid transition PENDING → REVIEWED", async () => {
		const result = await updateApplicationStatusService("app-1", "company-1", {
			status: "REVIEWED",
		});
		expect(result).toMatchObject({ status: "REVIEWED" });
	});

	it("allows valid transition PENDING → REJECTED", async () => {
		mockApp.update.mockResolvedValue({
			...fakeApplication,
			status: "REJECTED",
		} as any);
		const result = await updateApplicationStatusService("app-1", "company-1", {
			status: "REJECTED",
		});
		expect(result).toMatchObject({ status: "REJECTED" });
	});

	it("allows transition REVIEWED → SHORTLISTED", async () => {
		mockApp.findUnique.mockResolvedValue({
			...pendingApp,
			status: "REVIEWED",
		} as any);
		mockApp.update.mockResolvedValue({
			...fakeApplication,
			status: "SHORTLISTED",
		} as any);
		const result = await updateApplicationStatusService("app-1", "company-1", {
			status: "SHORTLISTED",
		});
		expect(result).toMatchObject({ status: "SHORTLISTED" });
	});

	it("allows transition SHORTLISTED → ACCEPTED", async () => {
		mockApp.findUnique.mockResolvedValue({
			...pendingApp,
			status: "SHORTLISTED",
		} as any);
		mockApp.update.mockResolvedValue({
			...fakeApplication,
			status: "ACCEPTED",
		} as any);
		const result = await updateApplicationStatusService("app-1", "company-1", {
			status: "ACCEPTED",
		});
		expect(result).toMatchObject({ status: "ACCEPTED" });
	});

	it("throws 422 for invalid transition PENDING → ACCEPTED", async () => {
		await expect(
			updateApplicationStatusService("app-1", "company-1", {
				status: "ACCEPTED",
			}),
		).rejects.toThrow(AppError);
	});

	it("throws 422 for invalid transition PENDING → SHORTLISTED", async () => {
		await expect(
			updateApplicationStatusService("app-1", "company-1", {
				status: "SHORTLISTED",
			}),
		).rejects.toThrow(AppError);
	});

	it("throws 422 when trying to move from a terminal REJECTED status", async () => {
		mockApp.findUnique.mockResolvedValue({
			...pendingApp,
			status: "REJECTED",
		} as any);
		await expect(
			updateApplicationStatusService("app-1", "company-1", {
				status: "REVIEWED",
			}),
		).rejects.toThrow(AppError);
	});

	it("throws 422 when trying to move from a terminal ACCEPTED status", async () => {
		mockApp.findUnique.mockResolvedValue({
			...pendingApp,
			status: "ACCEPTED",
		} as any);
		await expect(
			updateApplicationStatusService("app-1", "company-1", {
				status: "REJECTED",
			}),
		).rejects.toThrow(AppError);
	});

	it("throws 403 when company does not own the job", async () => {
		mockApp.findUnique.mockResolvedValue({
			...pendingApp,
			job: { companyId: "other-company", title: "Engineer" },
		} as any);
		await expect(
			updateApplicationStatusService("app-1", "company-1", {
				status: "REVIEWED",
			}),
		).rejects.toThrow(
			new AppError("You do not have access to this application.", 403),
		);
	});

	it("throws 404 when application not found", async () => {
		mockApp.findUnique.mockResolvedValue(null);
		await expect(
			updateApplicationStatusService("bad-id", "company-1", {
				status: "REVIEWED",
			}),
		).rejects.toThrow(new AppError("Application not found.", 404));
	});

	it("stores rejectionReason when rejecting", async () => {
		mockApp.update.mockResolvedValue({
			...fakeApplication,
			status: "REJECTED",
			rejectionReason: "Not a fit",
		} as any);
		await updateApplicationStatusService("app-1", "company-1", {
			status: "REJECTED",
			rejectionReason: "Not a fit",
		});
		expect(mockApp.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ rejectionReason: "Not a fit" }),
			}),
		);
	});
});

// ─── getMyApplicationsService ─────────────────────────────────────────────────

describe("getMyApplicationsService", () => {
	const appWithJob = {
		...fakeApplication,
		job: {
			id: "job-1",
			title: "Engineer",
			slug: "engineer",
			status: "OPEN",
			locationType: "REMOTE",
			experienceLevel: "MID",
			company: { id: "company-1", name: "Acme", logoUrl: null },
		},
	};

	beforeEach(() => {
		mockApp.findMany.mockResolvedValue([appWithJob] as any);
	});

	it("returns the candidate's own applications", async () => {
		const result = await getMyApplicationsService("user-1");
		expect(result.applications).toHaveLength(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("queries by userId", async () => {
		await getMyApplicationsService("user-1");
		expect(mockApp.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { userId: "user-1" } }),
		);
	});

	it("paginates when results exceed limit", async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({
			...appWithJob,
			id: `app-${i}`,
		}));
		mockApp.findMany.mockResolvedValue(many as any);
		const result = await getMyApplicationsService("user-1", undefined, 20);
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("app-19");
		expect(result.applications).toHaveLength(20);
	});

	it("passes cursor for pagination", async () => {
		await getMyApplicationsService("user-1", "app-5", 20);
		expect(mockApp.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ cursor: { id: "app-5" }, skip: 1 }),
		);
	});

	it("returns empty list when user has no applications", async () => {
		mockApp.findMany.mockResolvedValue([]);
		const result = await getMyApplicationsService("user-1");
		expect(result.applications).toHaveLength(0);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});
});

// ─── withdrawApplicationService ───────────────────────────────────────────────

describe("withdrawApplicationService", () => {
	beforeEach(() => {
		mockApp.findUnique.mockResolvedValue({
			userId: "user-1",
			status: "PENDING",
		} as any);
		mockApp.delete.mockResolvedValue(fakeApplication as any);
	});

	it("deletes a PENDING application", async () => {
		await withdrawApplicationService("app-1", "user-1");
		expect(mockApp.delete).toHaveBeenCalledWith({ where: { id: "app-1" } });
	});

	it("throws 403 when user does not own the application", async () => {
		mockApp.findUnique.mockResolvedValue({
			userId: "other-user",
			status: "PENDING",
		} as any);
		await expect(withdrawApplicationService("app-1", "user-1")).rejects.toThrow(
			new AppError("You do not own this application.", 403),
		);
	});

	it("throws 422 when application is REVIEWED (not withdrawable)", async () => {
		mockApp.findUnique.mockResolvedValue({
			userId: "user-1",
			status: "REVIEWED",
		} as any);
		await expect(withdrawApplicationService("app-1", "user-1")).rejects.toThrow(
			AppError,
		);
	});

	it("throws 422 when application is ACCEPTED (not withdrawable)", async () => {
		mockApp.findUnique.mockResolvedValue({
			userId: "user-1",
			status: "ACCEPTED",
		} as any);
		await expect(withdrawApplicationService("app-1", "user-1")).rejects.toThrow(
			AppError,
		);
	});

	it("throws 422 when application is REJECTED (not withdrawable)", async () => {
		mockApp.findUnique.mockResolvedValue({
			userId: "user-1",
			status: "REJECTED",
		} as any);
		await expect(withdrawApplicationService("app-1", "user-1")).rejects.toThrow(
			AppError,
		);
	});

	it("throws 404 when application not found", async () => {
		mockApp.findUnique.mockResolvedValue(null);
		await expect(
			withdrawApplicationService("bad-id", "user-1"),
		).rejects.toThrow(new AppError("Application not found.", 404));
	});
});
