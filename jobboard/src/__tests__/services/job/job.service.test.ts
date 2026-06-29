// src/__tests__/services/jobs/job.service.test.ts
import { beforeEach, describe, expect, it, type jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware/errorHandler";
import {
	createJobService,
	deleteJobService,
	getJobService,
	listJobsService,
	updateJobStatusService,
} from "@/services/v1/jobs/job.service";

const mockJob = prisma.job as jest.Mocked<typeof prisma.job>;
const mockTag = prisma.tag as jest.Mocked<typeof prisma.tag>;

const baseJob = {
	id: "job-1",
	title: "Senior Engineer",
	slug: "senior-engineer-1234567890",
	description:
		"A great job with plenty of responsibilities and growth opportunities for the right person.",
	location: "Lagos",
	locationType: "REMOTE" as const,
	salaryMin: 80000,
	salaryMax: 120000,
	currency: "USD",
	status: "DRAFT" as const,
	experienceLevel: "SENIOR" as const,
	companyId: "company-1",
	postedById: "user-1",
	expiresAt: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	tags: [],
	company: { id: "company-1", name: "Acme", logoUrl: null },
};

// ─── createJobService ──────────────────────────────────────────────────────────

describe("createJobService", () => {
	const input = {
		title: "Senior Engineer",
		description:
			"A great job with plenty of responsibilities and growth opportunities for the right person.",
		locationType: "REMOTE" as const,
	};

	beforeEach(() => {
		mockTag.upsert.mockResolvedValue({
			id: "tag-1",
			name: "React",
			slug: "react",
		});
		mockJob.create.mockResolvedValue({
			...baseJob,
			tags: [],
			postedBy: { id: "user-1", userName: "u", firstName: "F", lastName: "L" },
		} as unknown as typeof baseJob);
	});

	it("creates a job and returns it", async () => {
		const result = await createJobService("company-1", "user-1", input);
		expect(result).toMatchObject({ id: "job-1", title: "Senior Engineer" });
		expect(mockJob.create).toHaveBeenCalledTimes(1);
	});

	it("upserts tags when provided", async () => {
		await createJobService("company-1", "user-1", {
			...input,
			tags: ["React", "Node.js"],
		});
		expect(mockTag.upsert).toHaveBeenCalledTimes(2);
	});

	it("creates a slug from the title", async () => {
		await createJobService("company-1", "user-1", input);
		const callArgs = mockJob.create.mock.calls[0]![0] as {
			data: { slug: string };
		};
		expect(callArgs.data.slug).toMatch(/^senior-engineer-\d+$/);
	});

	it("trims whitespace from the title", async () => {
		await createJobService("company-1", "user-1", {
			...input,
			title: "  Senior Engineer  ",
		});
		const callArgs = mockJob.create.mock.calls[0]![0] as {
			data: { title: string };
		};
		expect(callArgs.data.title).toBe("Senior Engineer");
	});
});

// ─── listJobsService ───────────────────────────────────────────────────────────

describe("listJobsService", () => {
	const openJobs = [
		baseJob,
		{ ...baseJob, id: "job-2", title: "Junior Dev", status: "OPEN" as const },
	];

	beforeEach(() => {
		mockJob.findMany.mockResolvedValue(openJobs as unknown as typeof openJobs);
	});

	it("returns jobs and pagination metadata", async () => {
		const result = await listJobsService({});
		expect(result.jobs).toHaveLength(2);
		expect(result.hasNextPage).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	it("defaults to OPEN status filter", async () => {
		await listJobsService({});
		expect(mockJob.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ status: "OPEN" }),
			}),
		);
	});

	it("respects an explicit status filter", async () => {
		await listJobsService({ status: "DRAFT" });
		expect(mockJob.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ status: "DRAFT" }),
			}),
		);
	});

	it("paginates when there are more results than the limit", async () => {
		// Return limit+1 items to trigger hasNextPage
		const manyJobs = Array.from({ length: 21 }, (_, i) => ({
			...baseJob,
			id: `job-${i}`,
		}));
		mockJob.findMany.mockResolvedValue(manyJobs as unknown as typeof manyJobs);

		const result = await listJobsService({ limit: "20" });
		expect(result.hasNextPage).toBe(true);
		expect(result.nextCursor).toBe("job-19");
		expect(result.jobs).toHaveLength(20);
	});

	it("applies keyword search when provided", async () => {
		await listJobsService({ keyword: "react" });
		expect(mockJob.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					OR: [
						expect.objectContaining({
							title: expect.objectContaining({ contains: "react" }),
						}),
						expect.objectContaining({
							description: expect.objectContaining({ contains: "react" }),
						}),
					],
				}),
			}),
		);
	});
});

// ─── getJobService ─────────────────────────────────────────────────────────────

describe("getJobService", () => {
	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue(baseJob as unknown as typeof baseJob);
	});

	it("returns the job when found", async () => {
		const result = await getJobService("job-1");
		expect(result).toMatchObject({ id: "job-1" });
	});

	it("throws 404 when job is not found", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(getJobService("bad-id")).rejects.toThrow(
			new AppError("Job not found.", 404),
		);
	});
});

// ─── updateJobStatusService ────────────────────────────────────────────────────

describe("updateJobStatusService", () => {
	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue({
			companyId: "company-1",
			status: "DRAFT",
			title: "Senior Engineer",
		} as unknown as typeof baseJob);
		mockJob.update.mockResolvedValue({
			id: "job-1",
			status: "OPEN",
			updatedAt: new Date(),
		} as unknown as typeof baseJob);
	});

	it("allows valid transition DRAFT → OPEN", async () => {
		const result = await updateJobStatusService("job-1", "company-1", {
			status: "OPEN",
		});
		expect(result.status).toBe("OPEN");
	});

	it("throws 422 for invalid transition DRAFT → CLOSED", async () => {
		await expect(
			updateJobStatusService("job-1", "company-1", { status: "CLOSED" }),
		).rejects.toThrow(AppError);
	});

	it("throws 403 when company does not own the job", async () => {
		mockJob.findUnique.mockResolvedValue({
			companyId: "other-company",
			status: "DRAFT",
			title: "Senior Engineer",
		} as unknown as typeof baseJob);
		await expect(
			updateJobStatusService("job-1", "company-1", { status: "OPEN" }),
		).rejects.toThrow(new AppError("You do not own this job.", 403));
	});

	it("throws 404 when job is not found", async () => {
		mockJob.findUnique.mockResolvedValue(null);
		await expect(
			updateJobStatusService("job-1", "company-1", { status: "OPEN" }),
		).rejects.toThrow(new AppError("Job not found.", 404));
	});
});

// ─── deleteJobService ──────────────────────────────────────────────────────────

describe("deleteJobService", () => {
	beforeEach(() => {
		mockJob.findUnique.mockResolvedValue({
			companyId: "company-1",
		} as unknown as typeof baseJob);
		mockJob.update.mockResolvedValue({
			...baseJob,
			deletedAt: new Date(),
			status: "CLOSED",
		} as unknown as typeof baseJob);
	});

	it("soft-deletes the job", async () => {
		await deleteJobService("job-1", "company-1");
		expect(mockJob.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: "job-1" },
				data: expect.objectContaining({
					deletedAt: expect.any(Date),
					status: "CLOSED",
				}),
			}),
		);
	});

	it("throws 403 when another company tries to delete", async () => {
		mockJob.findUnique.mockResolvedValue({
			companyId: "other-company",
		} as unknown as typeof baseJob);
		await expect(deleteJobService("job-1", "company-1")).rejects.toThrow(
			new AppError("You do not own this job.", 403),
		);
	});
});
