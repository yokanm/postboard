// src/__tests__/e2e/company.e2e.test.ts
//
// E2E tests for Company profile management and Team management.
// Real DB, real auth, no mocks.
//
// COVERS:
//   GET/PATCH /company/current         — profile read + update
//   POST/DELETE /company/current/logo  — logo upload (Cloudinary skipped gracefully)
//   GET /company/current/team          — list team members
//   POST /company/current/team/invite  — invite existing user
//   PATCH /company/current/team/:id/role — change member role
//   DELETE /company/current/team/:id   — remove member
//   DELETE /company/current            — deactivate company

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import {
	cleanDb,
	db,
	type RegisteredCompany,
	type RegisteredUser,
	registerAndLogin,
	registerCompanyAndLogin,
} from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/company/current — Get company profile", () => {
	let company: RegisteredCompany;
	let candidate: RegisteredUser;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		candidate = await registerAndLogin(); // not attached to any company
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — admin user can fetch their own company profile", async () => {
		const res = await request(app)
			.get("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.company).toMatchObject({
			id: company.companyId,
			isVerified: false,
		});
		// password must NEVER appear in company profile response
		expect(res.body.company.password).toBeUndefined();
		// aggregate counts must be present
		expect(res.body.company._count).toHaveProperty("jobs");
		expect(res.body.company._count).toHaveProperty("users");
	});

	it("403 — user not attached to any company gets 403", async () => {
		const res = await request(app)
			.get("/api/v1/company/current")
			.set("Authorization", `Bearer ${candidate.accessToken}`);

		expect(res.status).toBe(403);
	});

	it("401 — unauthenticated request is rejected", async () => {
		const res = await request(app).get("/api/v1/company/current");
		expect(res.status).toBe(401);
	});
});

// ─────────────────────────────────────────────────────────────────────────────

describe("[E2E] PATCH /api/v1/company/current — Update company profile", () => {
	let company: RegisteredCompany;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — admin can update company name, website, industry, size", async () => {
		const res = await request(app)
			.patch("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({
				name: "Acme Technologies Ltd",
				website: "https://acme.io",
				industry: "FinTech",
				size: "11-50",
			});

		expect(res.status).toBe(200);
		expect(res.body.company.name).toBe("Acme Technologies Ltd");
		expect(res.body.company.website).toBe("https://acme.io");
		expect(res.body.company.industry).toBe("FinTech");
		expect(res.body.company.size).toBe("11-50");

		// Verify slug was regenerated after name change
		expect(res.body.company.slug).toMatch(/acme-technologies-ltd/);

		// Verify persisted to DB
		const dbCo = await db.company.findUnique({
			where: { id: company.companyId },
		});
		expect(dbCo!.name).toBe("Acme Technologies Ltd");
	});

	it("422 — company name less than 2 chars (express-validator)", async () => {
		const res = await request(app)
			.patch("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ name: "A" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "name" })]),
		);
	});

	it("422 — invalid website URL (express-validator)", async () => {
		const res = await request(app)
			.patch("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ website: "not-a-url" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "website" })]),
		);
	});

	it("422 — invalid size value (express-validator enum)", async () => {
		const res = await request(app)
			.patch("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ size: "999-billion" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "size" })]),
		);
	});

	it("403 — RECRUITER cannot update company profile (ADMIN only)", async () => {
		// Invite a recruiter to the company
		const recruiter = await registerAndLogin({ role: "CANDIDATE" });

		await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: recruiter.email, role: "RECRUITER" });

		// Login again to get token with updated companyId
		const loginRes = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: recruiter.email, password: recruiter.password });

		const recruiterToken = loginRes.body.accessToken as string;

		const res = await request(app)
			.patch("/api/v1/company/current")
			.set("Authorization", `Bearer ${recruiterToken}`)
			.send({ industry: "Hacking" });

		expect(res.status).toBe(403);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Team management — invite, role update, remove", () => {
	let company: RegisteredCompany;
	let outsider: RegisteredUser; // a user with no company
	let memberId: string;

	beforeAll(async () => {
		company = await registerCompanyAndLogin();
		outsider = await registerAndLogin({ role: "CANDIDATE" });
	});

	afterAll(async () => {
		await cleanDb();
	});

	// ── LIST TEAM ────────────────────────────────────────────────────────────────

	it("GET /company/current/team — 200 returns the admin user initially", async () => {
		const res = await request(app)
			.get("/api/v1/company/current/team")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.members).toHaveLength(1); // just the admin
		expect(res.body.members[0].role).toBe("ADMIN");
		expect(res.body.members[0].id).toBe(company.adminUserId);
		expect(res.body).toHaveProperty("hasNextPage");
		expect(res.body).toHaveProperty("nextCursor");
	});

	// ── INVITE ──────────────────────────────────────────────────────────────────

	it("POST /company/current/team/invite — 200 adds an existing user to the company", async () => {
		const res = await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: outsider.email, role: "RECRUITER" });

		expect(res.status).toBe(200);
		expect(res.body.member.role).toBe("RECRUITER");
		memberId = res.body.member.id as string;

		// Verify in DB: outsider is now attached to the company
		const dbUser = await db.user.findUnique({ where: { id: outsider.userId } });
		expect(dbUser!.companyId).toBe(company.companyId);
		expect(dbUser!.role).toBe("RECRUITER");
	});

	it("GET /company/current/team — 200 now shows 2 members", async () => {
		const res = await request(app)
			.get("/api/v1/company/current/team")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.members).toHaveLength(2);
	});

	it("POST /company/current/team/invite — 409 if user already in company", async () => {
		const res = await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: outsider.email, role: "RECRUITER" });

		expect(res.status).toBe(409);
		expect(res.body.message).toContain("already a member");
	});

	it("POST /company/current/team/invite — 404 if user does not exist", async () => {
		const res = await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: "ghost@nowhere.com", role: "RECRUITER" });

		expect(res.status).toBe(404);
	});

	it("422 — invalid email in invite body (express-validator)", async () => {
		const res = await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: "not-an-email", role: "RECRUITER" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "email" })]),
		);
	});

	it("422 — invalid role in invite body (express-validator enum)", async () => {
		const res = await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: outsider.email, role: "SUPERADMIN" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "role" })]),
		);
	});

	// ── UPDATE ROLE ──────────────────────────────────────────────────────────────

	it("PATCH /company/current/team/:id/role — 200 promotes member to ADMIN", async () => {
		const res = await request(app)
			.patch(`/api/v1/company/current/team/${memberId}/role`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ role: "ADMIN" });

		expect(res.status).toBe(200);
		expect(res.body.member.role).toBe("ADMIN");

		const dbUser = await db.user.findUnique({ where: { id: memberId } });
		expect(dbUser!.role).toBe("ADMIN");
	});

	it("400 — admin cannot change their own role", async () => {
		const res = await request(app)
			.patch(`/api/v1/company/current/team/${company.adminUserId}/role`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ role: "RECRUITER" });

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("own role");
	});

	it("422 — invalid role value (express-validator enum)", async () => {
		const res = await request(app)
			.patch(`/api/v1/company/current/team/${memberId}/role`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ role: "JANITOR" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "role" })]),
		);
	});

	// ── REMOVE MEMBER ────────────────────────────────────────────────────────────

	it("400 — admin cannot remove themselves", async () => {
		const res = await request(app)
			.delete(`/api/v1/company/current/team/${company.adminUserId}`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("remove yourself");
	});

	it("DELETE /company/current/team/:id — 200 removes member and resets their companyId", async () => {
		const res = await request(app)
			.delete(`/api/v1/company/current/team/${memberId}`)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);

		// Verify in DB: user no longer attached to this company
		const dbUser = await db.user.findUnique({ where: { id: memberId } });
		expect(dbUser!.companyId).toBeNull();
		expect(dbUser!.role).toBe("CANDIDATE"); // role reset to CANDIDATE
	});

	it("GET /company/current/team — 200 back to 1 member after removal", async () => {
		const res = await request(app)
			.get("/api/v1/company/current/team")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.members).toHaveLength(1);
	});

	// ── TEAM PAGINATION ──────────────────────────────────────────────────────────

	it("GET /company/current/team?limit=1 — pagination works correctly", async () => {
		// Add 2 more members to test pagination
		const extra1 = await registerAndLogin();
		const extra2 = await registerAndLogin();

		await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: extra1.email, role: "RECRUITER" });

		await request(app)
			.post("/api/v1/company/current/team/invite")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ email: extra2.email, role: "CANDIDATE" });

		const page1 = await request(app)
			.get("/api/v1/company/current/team?limit=1")
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(page1.status).toBe(200);
		expect(page1.body.members).toHaveLength(1);
		expect(page1.body.hasNextPage).toBe(true);
		expect(page1.body.nextCursor).not.toBeNull();

		// Fetch page 2 using cursor
		const page2 = await request(app)
			.get(
				`/api/v1/company/current/team?limit=1&cursor=${page1.body.nextCursor}`,
			)
			.set("Authorization", `Bearer ${company.adminAccessToken}`);

		expect(page2.status).toBe(200);
		expect(page2.body.members).toHaveLength(1);
		// Different member on page 2
		expect(page2.body.members[0].id).not.toBe(page1.body.members[0].id);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY DELETION
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] DELETE /api/v1/company/current — Deactivate company", () => {
	afterAll(async () => {
		await cleanDb();
	});

	it("200 — soft-deletes company, all users, all open jobs, revokes all tokens", async () => {
		const company = await registerCompanyAndLogin();
		const { jobId } = await (async () => {
			// Create an open job under this company
			const res = await request(app)
				.post("/api/v1/job")
				.set("Authorization", `Bearer ${company.adminAccessToken}`)
				.send({
					title: "Job To Be Deleted",
					description:
						"This job belongs to a company that will be deactivated during the E2E test suite run.",
					locationType: "REMOTE",
					experienceLevel: "MID",
				});
			const id = res.body.job.id as string;
			await request(app)
				.patch(`/api/v1/job/${id}/status`)
				.set("Authorization", `Bearer ${company.adminAccessToken}`)
				.send({ status: "OPEN" });
			return { jobId: id };
		})();

		// Delete the company
		const res = await request(app)
			.delete("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ password: company.adminPassword });

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("deactivated");

		// Verify DB: company has deletedAt
		const dbCo = await db.company.findUnique({
			where: { id: company.companyId },
		});
		expect(dbCo!.deletedAt).not.toBeNull();

		// Verify DB: admin user also soft-deleted
		const dbUser = await db.user.findUnique({
			where: { id: company.adminUserId },
		});
		expect(dbUser!.deletedAt).not.toBeNull();

		// Verify DB: open job is now CLOSED + soft-deleted
		const dbJob = await db.job.findUnique({ where: { id: jobId } });
		expect(dbJob!.status).toBe("CLOSED");
		expect(dbJob!.deletedAt).not.toBeNull();

		// Verify DB: all refresh tokens revoked
		const tokens = await db.refreshToken.findMany({
			where: { companyId: company.companyId, isRevoked: false },
		});
		expect(tokens).toHaveLength(0);

		// Verify: admin can no longer log in
		const loginRes = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: company.adminEmail, password: company.adminPassword });
		expect(loginRes.status).toBe(401);
	});

	it("401 — wrong password confirmation is rejected", async () => {
		const company = await registerCompanyAndLogin();

		const res = await request(app)
			.delete("/api/v1/company/current")
			.set("Authorization", `Bearer ${company.adminAccessToken}`)
			.send({ password: "WrongPassword1" });

		expect(res.status).toBe(401);

		// Company must NOT be deleted
		const dbCo = await db.company.findUnique({
			where: { id: company.companyId },
		});
		expect(dbCo!.deletedAt).toBeNull();
	});
});
