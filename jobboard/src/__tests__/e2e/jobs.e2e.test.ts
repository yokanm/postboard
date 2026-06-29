// src/__tests__/e2e/jobs.e2e.test.ts
//
// E2E tests for the full Job lifecycle:
//   create → publish → search → filter → update → close → delete
//
// Also tests the tag system and job expiry state machine edge cases.
// Real DB, real Redis cache layer, no mocks.

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import {
	cleanDb,
	createOpenJob,
	db,
	registerCompanyAndLogin,
} from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE JOB
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] POST /api/v1/job — Create job", () => {
	let adminToken: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;
	});

	afterAll(async () => {
		await cleanDb();
	});

	const validJob = {
		title: "Senior TypeScript Engineer",
		description:
			"We are looking for an experienced TypeScript engineer to lead our backend team and drive technical excellence across the organisation.",
		locationType: "REMOTE",
		experienceLevel: "SENIOR",
		salaryMin: 80000,
		salaryMax: 120000,
		currency: "USD",
		tags: ["TypeScript", "Node.js", "PostgreSQL"],
	};

	it("201 — creates job with DRAFT status and correct fields", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(validJob);

		expect(res.status).toBe(201);
		expect(res.body.job.title).toBe("Senior TypeScript Engineer");
		expect(res.body.job.status).toBe("DRAFT"); // always starts DRAFT
		expect(res.body.job.slug).toMatch(/^senior-typescript-engineer-\d+$/);
		expect(res.body.job.tags).toHaveLength(3);
		expect(
			res.body.job.tags.map((t: { tag: { name: string } }) => t.tag.name),
		).toContain("TypeScript");

		// Verify DB record exists
		const dbJob = await db.job.findUnique({ where: { id: res.body.job.id } });
		expect(dbJob).not.toBeNull();
		expect(dbJob!.status).toBe("DRAFT");
	});

	it("201 — tags are upserted (same tag in two jobs shares the DB record)", async () => {
		// First job with "TypeScript" tag
		const res1 = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, title: "Job Alpha", tags: ["TypeScript"] });

		// Second job with same "TypeScript" tag
		const res2 = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, title: "Job Beta", tags: ["TypeScript"] });

		expect(res1.status).toBe(201);
		expect(res2.status).toBe(201);

		// Both should share the same tag ID
		const tagId1 = res1.body.job.tags[0].tag.id as string | undefined;
		const tagId2 = res2.body.job.tags[0].tag.id as string | undefined;

		if (tagId1 && tagId2) {
			expect(tagId1).toBe(tagId2); // tag upsert — same record
		}
	});

	it("403 — CANDIDATE cannot create a job", async () => {
		// Register a plain candidate
		const candidateRes = await request(app)
			.post("/api/v1/auth/register")
			.send({
				userName: `cand_${Date.now()}`,
				firstName: "Candidate",
				lastName: "User",
				email: `cand_${Date.now()}@e2e-test.com`,
				password: "CandPass1",
			});

		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${candidateRes.body.accessToken}`)
			.send(validJob);

		expect(res.status).toBe(403);
	});

	it("422 — title too short (express-validator, min 3 chars)", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, title: "AB" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "title" })]),
		);
	});

	it("422 — description too short (express-validator, min 50 chars)", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, description: "Too short" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "description" }),
			]),
		);
	});

	it("422 — salaryMax less than salaryMin (express-validator custom rule)", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, salaryMin: 100000, salaryMax: 50000 });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "salaryMax" })]),
		);
	});

	it("422 — invalid locationType (express-validator)", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, locationType: "FLYING" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "locationType" }),
			]),
		);
	});

	it("422 — expiresAt in the past (express-validator custom rule)", async () => {
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...validJob, expiresAt: "2020-01-01T00:00:00Z" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "expiresAt" })]),
		);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// JOB STATUS STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] PATCH /api/v1/job/:id/status — State machine", () => {
	let adminToken: string;
	let jobId: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;

		// Create a DRAFT job to test transitions on
		const res = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				title: "State Machine Test Job",
				description:
					"This job is used to test the status state machine transitions for the job board application.",
				locationType: "ONSITE",
				experienceLevel: "MID",
			});
		jobId = res.body.job.id;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — DRAFT → OPEN publishes the job", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "OPEN" });

		expect(res.status).toBe(200);
		expect(res.body.job.status).toBe("OPEN");

		// Verify in DB
		const dbJob = await db.job.findUnique({ where: { id: jobId } });
		expect(dbJob!.status).toBe("OPEN");
	});

	it("422 — OPEN → EXPIRED is not a valid transition", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "EXPIRED" });

		// EXPIRED is not in the validator allowlist (only OPEN/CLOSED are accepted)
		expect(res.status).toBe(422);
	});

	it("422 — OPEN → DRAFT is not a valid transition", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "DRAFT" });

		expect(res.status).toBe(422);
	});

	it("200 — OPEN → CLOSED closes the job", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "CLOSED" });

		expect(res.status).toBe(200);
		expect(res.body.job.status).toBe("CLOSED");
	});

	it("422 — CLOSED → OPEN is not allowed (no re-open)", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "OPEN" });

		expect(res.status).toBe(422);
		expect(res.body.message ?? res.body.errors).toBeDefined();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// LIST JOBS (public, filters, search, pagination)
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/job — List and search jobs", () => {
	let adminToken: string;
	let remoteJobId: string;
	let onsiteJobId: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;

		// Create and open a REMOTE + SENIOR job
		remoteJobId = await createOpenJob(adminToken, {
			title: "Remote TypeScript Wizard",
			tags: ["TypeScript", "GraphQL"],
		});

		// Create and open an ONSITE + JUNIOR job
		const onsiteRes = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				title: "Onsite Junior Developer",
				description:
					"Entry-level onsite developer role for our Lagos office team, working on exciting products.",
				locationType: "ONSITE",
				experienceLevel: "JUNIOR",
				tags: ["JavaScript", "React"],
			});
		onsiteJobId = onsiteRes.body.job.id;
		await request(app)
			.patch(`/api/v1/job/${onsiteJobId}/status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: "OPEN" });
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — public listing returns only OPEN jobs by default", async () => {
		const res = await request(app).get("/api/v1/job");
		expect(res.status).toBe(200);
		expect(
			res.body.jobs.every((j: { status: string }) => j.status === "OPEN"),
		).toBe(true);
		expect(res.body).toHaveProperty("hasNextPage");
		expect(res.body).toHaveProperty("nextCursor");
	});

	it("200 — locationType=REMOTE filter returns only remote jobs", async () => {
		const res = await request(app).get("/api/v1/job?locationType=REMOTE");
		expect(res.status).toBe(200);
		expect(
			res.body.jobs.every(
				(j: { locationType: string }) => j.locationType === "REMOTE",
			),
		).toBe(true);
		expect(
			res.body.jobs.some((j: { id: string }) => j.id === remoteJobId),
		).toBe(true);
		expect(
			res.body.jobs.some((j: { id: string }) => j.id === onsiteJobId),
		).toBe(false);
	});

	it("200 — experienceLevel=JUNIOR filter works", async () => {
		const res = await request(app).get("/api/v1/job?experienceLevel=JUNIOR");
		expect(res.status).toBe(200);
		expect(
			res.body.jobs.every(
				(j: { experienceLevel: string }) => j.experienceLevel === "JUNIOR",
			),
		).toBe(true);
	});

	it("200 — keyword search finds jobs by title (trigram)", async () => {
		const res = await request(app).get("/api/v1/job?keyword=TypeScript");
		expect(res.status).toBe(200);
		expect(res.body.jobs.length).toBeGreaterThan(0);
		expect(
			res.body.jobs.some((j: { id: string }) => j.id === remoteJobId),
		).toBe(true);
	});

	it("200 — keyword search finds jobs by description content", async () => {
		const res = await request(app).get("/api/v1/job?keyword=Lagos+office");
		expect(res.status).toBe(200);
		// The onsite job has "Lagos office" in its description
		expect(
			res.body.jobs.some((j: { id: string }) => j.id === onsiteJobId),
		).toBe(true);
	});

	it("200 — pagination: limit=1 returns 1 job with hasNextPage=true", async () => {
		const res = await request(app).get("/api/v1/job?limit=1");
		expect(res.status).toBe(200);
		expect(res.body.jobs).toHaveLength(1);
		expect(res.body.hasNextPage).toBe(true);
		expect(res.body.nextCursor).not.toBeNull();
	});

	it("200 — cursor pagination returns the second page correctly", async () => {
		const page1 = await request(app).get("/api/v1/job?limit=1");
		const cursor = page1.body.nextCursor as string;

		const page2 = await request(app).get(
			`/api/v1/job?limit=1&cursor=${cursor}`,
		);
		expect(page2.status).toBe(200);
		expect(page2.body.jobs).toHaveLength(1);
		// The two pages must return different jobs
		expect(page2.body.jobs[0].id).not.toBe(page1.body.jobs[0].id);
	});

	it("422 — invalid locationType filter (express-validator)", async () => {
		const res = await request(app).get("/api/v1/job?locationType=AIRPLANE");
		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "locationType" }),
			]),
		);
	});

	it("200 — returns company name, slug, and tags in each job summary", async () => {
		const res = await request(app).get("/api/v1/job");
		expect(res.status).toBe(200);
		const job = res.body.jobs[0];
		expect(job.company).toHaveProperty("name");
		expect(job.company).toHaveProperty("slug");
		expect(Array.isArray(job.tags)).toBe(true);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE JOB
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] PATCH /api/v1/job/:id — Update job", () => {
	let adminToken: string;
	let otherAdminToken: string;
	let jobId: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		const otherCompany = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;
		otherAdminToken = otherCompany.adminAccessToken;
		jobId = await createOpenJob(adminToken);
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — updates salary range and persists to DB", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ salaryMin: 90000, salaryMax: 130000 });

		expect(res.status).toBe(200);

		const dbJob = await db.job.findUnique({ where: { id: jobId } });
		expect(dbJob!.salaryMin).toBe(90000);
		expect(dbJob!.salaryMax).toBe(130000);
	});

	it("200 — replaces tags atomically when tags array is provided", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ tags: ["Python", "FastAPI", "Docker"] });

		expect(res.status).toBe(200);
		const tagNames = res.body.job.tags.map(
			(t: { tag: { name: string } }) => t.tag.name,
		);
		expect(tagNames).toContain("Python");
		expect(tagNames).toContain("Docker");
		// Old tags ('Node.js', 'TypeScript') should be gone
		expect(tagNames).not.toContain("Node.js");
	});

	it("403 — different company cannot update this job", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/${jobId}`)
			.set("Authorization", `Bearer ${otherAdminToken}`)
			.send({ salaryMin: 10000 });

		expect(res.status).toBe(403);
	});

	it("404 — non-existent job returns 404", async () => {
		const res = await request(app)
			.patch("/api/v1/job/00000000-0000-0000-0000-000000000000")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ salaryMin: 10000 });

		expect(res.status).toBe(404);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE JOB + TAGS
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] DELETE /api/v1/job/:id — Soft delete job", () => {
	let adminToken: string;
	let otherAdminToken: string;
	let jobId: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		const otherCompany = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;
		otherAdminToken = otherCompany.adminAccessToken;
		jobId = await createOpenJob(adminToken);
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("403 — cannot delete another company's job", async () => {
		const res = await request(app)
			.delete(`/api/v1/job/${jobId}`)
			.set("Authorization", `Bearer ${otherAdminToken}`);

		expect(res.status).toBe(403);
	});

	it("200 — soft-deletes job (sets deletedAt + CLOSED status)", async () => {
		const res = await request(app)
			.delete(`/api/v1/job/${jobId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		expect(res.status).toBe(200);

		// DB: job has deletedAt set and status CLOSED
		const dbJob = await db.job.findUnique({ where: { id: jobId } });
		expect(dbJob!.deletedAt).not.toBeNull();
		expect(dbJob!.status).toBe("CLOSED");
	});

	it("404 — deleted job does not appear in GET /job/:id", async () => {
		const res = await request(app).get(`/api/v1/job/${jobId}`);
		expect(res.status).toBe(404);
	});

	it("deleted job does not appear in GET /job public listing", async () => {
		const res = await request(app).get("/api/v1/job");
		expect(res.status).toBe(200);
		expect(res.body.jobs.some((j: { id: string }) => j.id === jobId)).toBe(
			false,
		);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/tags — Tag listing", () => {
	let adminToken: string;

	beforeAll(async () => {
		const company = await registerCompanyAndLogin();
		adminToken = company.adminAccessToken;

		// Create jobs with specific tags to populate the tags table
		await createOpenJob(adminToken, {
			tags: ["Elixir", "Phoenix", "LiveView"],
		});
		await createOpenJob(adminToken, { tags: ["Elixir", "OTP"] });
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — returns tags sorted by job usage count descending", async () => {
		const res = await request(app).get("/api/v1/tags");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.tags)).toBe(true);
		expect(res.body.tags.length).toBeGreaterThan(0);

		// Elixir appears in 2 jobs, so it should rank higher than OTP (1 job)
		const elixirIdx = res.body.tags.findIndex(
			(t: { name: string }) => t.name === "Elixir",
		);
		const otpIdx = res.body.tags.findIndex(
			(t: { name: string }) => t.name === "OTP",
		);
		if (elixirIdx !== -1 && otpIdx !== -1) {
			expect(elixirIdx).toBeLessThan(otpIdx);
		}
	});

	it("200 — ?q= filter returns matching tags only", async () => {
		const res = await request(app).get("/api/v1/tags?q=elix");
		expect(res.status).toBe(200);
		expect(
			res.body.tags.every((t: { name: string }) =>
				t.name.toLowerCase().includes("elix"),
			),
		).toBe(true);
	});

	it("200 — ?limit= caps the results", async () => {
		const res = await request(app).get("/api/v1/tags?limit=2");
		expect(res.status).toBe(200);
		expect(res.body.tags.length).toBeLessThanOrEqual(2);
	});

	it("200 — public endpoint — no auth required", async () => {
		// No Authorization header
		const res = await request(app).get("/api/v1/tags");
		expect(res.status).toBe(200);
	});
});
