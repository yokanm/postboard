// src/__tests__/e2e/user.e2e.test.ts
//
// E2E tests for the User and Profile endpoints.
// All requests hit a real database. No mocks.

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import { cleanDb, db, registerAndLogin } from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// GET CURRENT USER
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] GET /api/v1/user/current — Get current user", () => {
	let accessToken: string;
	let userId: string;

	beforeAll(async () => {
		const result = await registerAndLogin();
		accessToken = result.accessToken;
		userId = result.userId;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — returns full user object with null profile (not yet created)", async () => {
		const res = await request(app)
			.get("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.user).toMatchObject({
			id: userId,
			role: "CANDIDATE",
			isVerified: false,
		});
		expect(res.body.user.password).toBeUndefined(); // password must never be returned
		expect(res.body.user.profile).toBeNull(); // no profile yet
	});

	it("401 — no Authorization header", async () => {
		const res = await request(app).get("/api/v1/user/current");
		expect(res.status).toBe(401);
	});

	it("401 — malformed token", async () => {
		const res = await request(app)
			.get("/api/v1/user/current")
			.set("Authorization", "Bearer not.a.real.token");
		expect(res.status).toBe(401);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE USER
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] PATCH /api/v1/user/current — Update user", () => {
	let accessToken: string;
	let userId: string;

	beforeAll(async () => {
		const result = await registerAndLogin();
		accessToken = result.accessToken;
		userId = result.userId;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — updates firstName and phone, persists to DB", async () => {
		const res = await request(app)
			.patch("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ firstName: "Adaeze", phone: "+2348012345678" });

		expect(res.status).toBe(200);
		expect(res.body.user.firstName).toBe("Adaeze");
		expect(res.body.user.phone).toBe("+2348012345678");

		// Verify persisted in real DB
		const dbUser = await db.user.findUnique({ where: { id: userId } });
		expect(dbUser!.firstName).toBe("Adaeze");
		expect(dbUser!.phone).toBe("+2348012345678");
	});

	it("200 — partial update: only lastName changed, other fields unchanged", async () => {
		const res = await request(app)
			.patch("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ lastName: "Okonkwo" });

		expect(res.status).toBe(200);
		expect(res.body.user.lastName).toBe("Okonkwo");
		// firstName should still be the previously updated value
		expect(res.body.user.firstName).toBe("Adaeze");
	});

	it("422 — userName with spaces is rejected (express-validator)", async () => {
		const res = await request(app)
			.patch("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ userName: "ada okafor" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "userName" })]),
		);
	});

	it("422 — firstName exceeding 50 chars (express-validator)", async () => {
		const res = await request(app)
			.patch("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ firstName: "A".repeat(51) });

		expect(res.status).toBe(422);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE UPSERT
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] PUT /api/v1/user/current/profile — Upsert profile", () => {
	let accessToken: string;
	let userId: string;

	beforeAll(async () => {
		const result = await registerAndLogin();
		accessToken = result.accessToken;
		userId = result.userId;
	});

	afterAll(async () => {
		await cleanDb();
	});

	it("200 — creates profile on first call", async () => {
		const res = await request(app)
			.put("/api/v1/user/current/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				bio: "A seasoned backend engineer with 5 years of experience",
				skills: ["TypeScript", "Node.js", "PostgreSQL"],
				location: "Lagos, Nigeria",
				linkedinUrl: "https://linkedin.com/in/ada",
				githubUrl: "https://github.com/ada",
			});

		expect(res.status).toBe(200);
		expect(res.body.profile.bio).toBe(
			"A seasoned backend engineer with 5 years of experience",
		);
		expect(res.body.profile.skills).toEqual([
			"TypeScript",
			"Node.js",
			"PostgreSQL",
		]);
		expect(res.body.profile.location).toBe("Lagos, Nigeria");

		// Verify in real DB
		const dbProfile = await db.userProfile.findUnique({ where: { userId } });
		expect(dbProfile).not.toBeNull();
		expect(dbProfile!.skills).toEqual(["TypeScript", "Node.js", "PostgreSQL"]);
	});

	it("200 — updates skills on second call (upsert)", async () => {
		const res = await request(app)
			.put("/api/v1/user/current/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ skills: ["TypeScript", "Node.js", "PostgreSQL", "Redis"] });

		expect(res.status).toBe(200);
		expect(res.body.profile.skills).toEqual([
			"TypeScript",
			"Node.js",
			"PostgreSQL",
			"Redis",
		]);
	});

	it("200 — GET /user/current now includes the profile", async () => {
		const res = await request(app)
			.get("/api/v1/user/current")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.status).toBe(200);
		expect(res.body.user.profile).not.toBeNull();
		expect(res.body.user.profile.skills).toContain("TypeScript");
	});

	it("422 — bio exceeding 1000 chars (express-validator)", async () => {
		const res = await request(app)
			.put("/api/v1/user/current/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ bio: "x".repeat(1001) });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "bio" })]),
		);
	});

	it("422 — invalid linkedinUrl (express-validator)", async () => {
		const res = await request(app)
			.put("/api/v1/user/current/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ linkedinUrl: "not-a-url" });

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ field: "linkedinUrl" }),
			]),
		);
	});

	it("422 — individual skill over 50 chars (express-validator)", async () => {
		const res = await request(app)
			.put("/api/v1/user/current/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ skills: ["ValidSkill", "x".repeat(51)] });

		expect(res.status).toBe(422);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE ACCOUNT
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] DELETE /api/v1/user/current — Delete account", () => {
	afterAll(async () => {
		await cleanDb();
	});

	it("200 — soft-deletes user and revokes all refresh tokens", async () => {
		const password = "DeletePass1";
		const result = await registerAndLogin({ password });

		const res = await request(app)
			.delete("/api/v1/user/current")
			.set("Authorization", `Bearer ${result.accessToken}`)
			.send({ password });

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("deactivated");

		// Verify DB: user has deletedAt set
		const dbUser = await db.user.findUnique({ where: { id: result.userId } });
		expect(dbUser!.deletedAt).not.toBeNull();

		// Verify DB: all refresh tokens revoked
		const tokens = await db.refreshToken.findMany({
			where: { userId: result.userId, isRevoked: false },
		});
		expect(tokens).toHaveLength(0);

		// Deleted user cannot log in
		const loginRes = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: result.email, password });
		expect(loginRes.status).toBe(401);
	});

	it("401 — wrong password confirmation", async () => {
		const result = await registerAndLogin({ password: "RightPass1" });

		const res = await request(app)
			.delete("/api/v1/user/current")
			.set("Authorization", `Bearer ${result.accessToken}`)
			.send({ password: "WrongPass1" });

		expect(res.status).toBe(401);
	});

	it("422 — missing password in body (express-validator)", async () => {
		const result = await registerAndLogin();

		const res = await request(app)
			.delete("/api/v1/user/current")
			.set("Authorization", `Bearer ${result.accessToken}`)
			.send({});

		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "password" })]),
		);
	});
});
