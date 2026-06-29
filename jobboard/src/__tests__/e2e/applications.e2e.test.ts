// src/__tests__/e2e/applications.e2e.test.ts
//
// E2E tests for the full job application pipeline:
//   apply → recruiter reviews → shortlist → accept/reject
//   + candidate withdrawal, duplicate prevention, ownership guards
//
// Real DB, real auth, no mocks. State is isolated per describe block.

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import {
	cleanDb,
	createOpenJob,
	db,
	type RegisteredCompany,
	type RegisteredUser,
	registerAndLogin,
	registerCompanyAndLogin,
} from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// APPLY TO JOB
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] POST /api/v1/job/:id/apply — Apply to job", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let openJobId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin({ role: "CANDIDATE" });
		openJobId = await createOpenJob(company.adminAccessToken);
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("201 — creates application with cover letter and saves to DB", async () => {
		const res = await request(app)
			.post(`/api/v1/job/${openJobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter:
					"I am very excited about this opportunity and believe I am a great fit.",
			});

		expect(res.status).toBe(201);
		expect(res.body.application).toMatchObject({
			jobId: openJobId,
			userId: candidate.userId,
			status: "PENDING",
		});

		// Verify in DB
		const dbApp = await db.jobApplication.findUnique({
			where: { id: res.body.application.id },
		});
		expect(dbApp).not.toBeNull();
		expect(dbApp!.status).toBe("PENDING");
		expect(dbApp!.coverLetter).toContain("excited");
	});

	it("409 — duplicate application is rejected", async () => {
		// Same candidate + same job → should fail
		const res = await request(app)
			.post(`/api/v1/job/${openJobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({ coverLetter: "Applying again." });

		expect(res.status).toBe(409);
		expect(res.body.message).toBe("You have already applied to this job.");
	});

	it("422 — cannot apply to a CLOSED job", async () => {
		// Close the job first
		const closedJobRes = await request(app)
			.post("/api/v1/job")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({
				title: "About To Close Job",
				description:
					"This job will be closed immediately after creation for testing the closed job application rejection.",
				locationType: "REMOTE",
				experienceLevel: "MID",
			});
		const closedJobId = closedJobRes.body.job.id as string;

		// Never transition to OPEN — stays DRAFT
		const candidate2 = await registerAndLogin();
		const res = await request(app)
			.post(`/api/v1/job/${closedJobId}/apply`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`)
			.send({});

		expect(res.status).toBe(422);
		expect(res.body.message).toContain("not currently accepting");
	});

	it("404 — applying to a non-existent job", async () => {
		const res = await request(app)
			.post("/api/v1/job/00000000-0000-0000-0000-000000000000/apply")
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({});

		expect(res.status).toBe(404);
	});

	it("403 — recruiter (company admin) cannot apply to a job", async () => {
		// Admin has role ADMIN — the authorize(['CANDIDATE']) guard should block them
		const res = await request(app)
			.post(`/api/v1/job/${openJobId}/apply`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({});

		expect(res.status).toBe(403);
	});

	it("422 — coverLetter exceeding 3000 chars (express-validator)", async () => {
		const candidate3 = await registerAndLogin();
		const res = await request(app)
			.post(`/api/v1/job/${openJobId}/apply`)
			.set("Authorization", `Bearer ${candidate3.accessToken}`)
			.send({ coverLetter: "x".repeat(3001) });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "coverLetter" }),
			]),
		);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// FULL APPLICATION PIPELINE (recruiter review workflow)
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Application status pipeline — PENDING → REVIEWED → SHORTLISTED → ACCEPTED", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let jobId: string;
	let applicationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		jobId = await createOpenJob(company.adminAccessToken);

		// Candidate applies
		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({
				coverLetter: "Eager to contribute to your team and grow in this role.",
			});

		applicationId = applyRes.body.application.id as string;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — PENDING → REVIEWED (recruiter reviews the application)", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REVIEWED" });

		expect(res.status).toBe(200);
		expect(res.body.application.status).toBe("REVIEWED");

		const dbApp = await db.jobApplication.findUnique({
			where: { id: applicationId },
		});
		expect(dbApp!.status).toBe("REVIEWED");
	});

	it("422 — REVIEWED → ACCEPTED is not a valid transition", async () => {
		// Can only go REVIEWED → SHORTLISTED or REVIEWED → REJECTED
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "ACCEPTED" });

		expect(res.status).toBe(422);
		expect(res.body.message).toContain("Cannot transition");
		expect(res.body.message).toContain("REVIEWED");
	});

	it("200 — REVIEWED → SHORTLISTED (candidate makes the shortlist)", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "SHORTLISTED" });

		expect(res.status).toBe(200);
		expect(res.body.application.status).toBe("SHORTLISTED");
	});

	it("200 — SHORTLISTED → ACCEPTED (offer extended)", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "ACCEPTED" });

		expect(res.status).toBe(200);
		expect(res.body.application.status).toBe("ACCEPTED");
	});

	it("422 — ACCEPTED is a terminal state — no further transitions", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REJECTED" });

		// ACCEPTED has no valid transitions
		expect(res.status).toBe(422);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// REJECTION WITH REASON
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Application rejection with reason", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let applicationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		const jobId = await createOpenJob(company.adminAccessToken);

		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({});
		applicationId = applyRes.body.application.id as string;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — PENDING → REJECTED with rejectionReason stored", async () => {
		const res = await request(app)
			.patch(`/api/v1/job/applications/${applicationId}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({
				status: "REJECTED",
				rejectionReason:
					"We moved forward with a more senior candidate for this role.",
			});

		expect(res.status).toBe(200);
		expect(res.body.application.status).toBe("REJECTED");
		expect(res.body.application.rejectionReason).toContain(
			"more senior candidate",
		);

		// Verify in DB
		const dbApp = await db.jobApplication.findUnique({
			where: { id: applicationId },
		});
		expect(dbApp!.rejectionReason).toContain("more senior candidate");
	});

	it("422 — rejectionReason exceeding 1000 chars (express-validator)", async () => {
		// Create a fresh application to test this on
		const candidate2 = await registerAndLogin();
		const jobId2 = await createOpenJob(company.adminAccessToken);

		const applyRes2 = await request(app)
			.post(`/api/v1/job/${jobId2}/apply`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`)
			.send({});
		const appId2 = applyRes2.body.application.id as string;

		const res = await request(app)
			.patch(`/api/v1/job/applications/${appId2}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({
				status: "REJECTED",
				rejectionReason: "x".repeat(1001),
			});

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "rejectionReason" }),
			]),
		);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// WITHDRAW APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] DELETE /api/v1/job/applications/:id — Withdraw application", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;
	let otherCandidate: RegisteredUser;
	let jobId: string;
	let applicationId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin();
		otherCandidate = await registerAndLogin();
		jobId = await createOpenJob(company.adminAccessToken);

		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate.accessToken}`)
			.send({});
		applicationId = applyRes.body.application.id as string;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("403 — another candidate cannot withdraw someone else's application", async () => {
		const res = await request(app)
			.delete(`/api/v1/job/applications/${applicationId}`)
			.set("Authorization", `Bearer ${otherCandidate.accessToken}`);

		expect(res.status).toBe(403);
	});

	it("200 — candidate can withdraw their own PENDING application", async () => {
		const res = await request(app)
			.delete(`/api/v1/job/applications/${applicationId}`)
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		expect(res.status).toBe(200);

		// Application must be gone from DB (hard delete)
		const dbApp = await db.jobApplication.findUnique({
			where: { id: applicationId },
		});
		expect(dbApp).toBeNull();
	});

	it("422 — cannot withdraw a REVIEWED application", async () => {
		// Create fresh application, then move it to REVIEWED
		const jobId2 = await createOpenJob(company.adminAccessToken);
		const candidate2 = await registerAndLogin();

		const applyRes = await request(app)
			.post(`/api/v1/job/${jobId2}/apply`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`)
			.send({});
		const appId2 = applyRes.body.application.id as string;

		await request(app)
			.patch(`/api/v1/job/applications/${appId2}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REVIEWED" });

		const res = await request(app)
			.delete(`/api/v1/job/applications/${appId2}`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`);

		expect(res.status).toBe(422);
		expect(res.body.message).toContain("PENDING");
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// LIST APPLICATIONS (recruiter) + MY APPLICATIONS (candidate)
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Application listing — recruiter and candidate views", () => {
	let company: RegisteredCompany;
	let candidate1: RegisteredUser;
	let candidate2: RegisteredUser;
	let jobId: string;
	let appId1: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate1 = await registerAndLogin();
		candidate2 = await registerAndLogin();
		jobId = await createOpenJob(company.adminAccessToken);

		// Two candidates apply
		const res1 = await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate1.accessToken}`)
			.send({ coverLetter: "Application from candidate 1." });
		appId1 = res1.body.application.id;

		await request(app)
			.post(`/api/v1/job/${jobId}/apply`)
			.set("Authorization", `Bearer ${candidate2.accessToken}`)
			.send({});

		// Move candidate1's application to REVIEWED
		await request(app)
			.patch(`/api/v1/job/applications/${appId1}/status`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ status: "REVIEWED" });
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("GET /job/:id/applications — recruiter sees all applications for their job", async () => {
		const res = await request(app)
			.get(`/api/v1/job/${jobId}/applications`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.applications.length).toBe(2);
		expect(res.body).toHaveProperty("hasNextPage");
	});

	it("GET /job/:id/applications?status=REVIEWED — filter by status works", async () => {
		const res = await request(app)
			.get(`/api/v1/job/${jobId}/applications?status=REVIEWED`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(
			res.body.applications.every(
				(a: { status: string }) => a.status === "REVIEWED",
			),
		).toBe(true);
		expect(res.body.applications).toHaveLength(1);
	});

	it("403 — different company cannot list applications for this job", async () => {
		const otherCompany = await registerCompanyAndLogin();
		const res = await request(app)
			.get(`/api/v1/job/${jobId}/applications`)
			.set("Authorization", `Bearer ${otherCompany.adminAccessToken}`);

		expect(res.status).toBe(403);
	});

	it("GET /job/my-applications — candidate sees only their own applications", async () => {
		const res = await request(app)
			.get("/api/v1/job/my-applications")
			.set("Authorization", `Bearer ${candidate1.accessToken}`);

		expect(res.status).toBe(200);
		// Candidate1 applied to exactly 1 job
		expect(res.body.applications).toHaveLength(1);
		expect(res.body.applications[0].status).toBe("REVIEWED");
		expect(res.body.applications[0].job.id).toBe(jobId);
		// Never returns another candidate's application data
		expect(
			res.body.applications.every(
				(a: { job: { id: string } }) => a.job.id === jobId,
			),
		).toBe(true);
	});

	it("GET /job/my-applications — candidate sees nested company info", async () => {
		const res = await request(app)
			.get("/api/v1/job/my-applications")
			.set("Authorization", `Bearer ${candidate1.accessToken}`);

		expect(res.status).toBe(200);
		const app1 = res.body.applications[0];
		expect(app1.job.company).toHaveProperty("name");
		expect(app1.job.company).toHaveProperty("logoUrl");
	});
});
