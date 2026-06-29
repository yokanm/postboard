// src/__tests__/integration/auth.routes.test.ts
//
// Integration tests — spins up the Express app in-memory (no listen()),
// hits real route handlers with supertest. Prisma + Redis + email are mocked
// at the module level in setup.ts.
//
// SETUP: npm install --save-dev supertest @types/supertest

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import * as password from "@/lib/password";
import { prisma } from "@/lib/prisma";

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockCompany = prisma.company as jest.Mocked<typeof prisma.company>;
const mockRefresh = prisma.refreshToken as jest.Mocked<
	typeof prisma.refreshToken
>;

const verifyPasswordSpy = jest.spyOn(password, "verifyPassword");

const fakeUser = {
	id: "user-123",
	userName: "testuser",
	firstName: "Test",
	lastName: "User",
	email: "test@example.com",
	password: "hashed-pass",
	role: "CANDIDATE" as const,
	phone: null,
	companyId: null,
	isVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	emailVerifyToken: null,
	emailVerifyExpiresAt: null,
	passwordResetToken: null,
	passwordResetExpiresAt: null,
};

// ─── POST /api/v1/auth/register ────────────────────────────────────────────────

describe("POST /api/v1/auth/register", () => {
	const validBody = {
		userName: "testuser",
		firstName: "Test",
		lastName: "User",
		email: "test@example.com",
		password: "Password1",
	};

	beforeEach(() => {
		mockUser.findUnique.mockResolvedValue(null); // no existing user
		mockUser.create.mockResolvedValue(fakeUser);
		mockRefresh.create.mockResolvedValue({
			id: "rt-1",
			token: "rt",
			userId: "user-123",
			companyId: null,
			isRevoked: false,
			expiresAt: new Date(),
			createdAt: new Date(),
		});
	});

	it("201 — returns user and accessToken on valid input", async () => {
		const res = await request(app)
			.post("/api/v1/auth/register")
			.send(validBody);
		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty("user");
		expect(res.body).toHaveProperty("accessToken");
		expect(res.headers["set-cookie"]).toBeDefined();
	});

	it("422 — missing email", async () => {
		const res = await request(app)
			.post("/api/v1/auth/register")
			.send({ ...validBody, email: "" });
		expect(res.status).toBe(422);
		expect(res.body.errors).toEqual(
			expect.arrayContaining([expect.objectContaining({ field: "email" })]),
		);
	});

	it("422 — password too short", async () => {
		const res = await request(app)
			.post("/api/v1/auth/register")
			.send({ ...validBody, password: "abc" });
		expect(res.status).toBe(422);
	});

	it("409 — duplicate email", async () => {
		mockUser.findUnique.mockResolvedValue(fakeUser);
		const res = await request(app)
			.post("/api/v1/auth/register")
			.send(validBody);
		expect(res.status).toBe(409);
		expect(res.body.message).toBe("Email already exists");
	});
});

// ─── POST /api/v1/auth/login ───────────────────────────────────────────────────

describe("POST /api/v1/auth/login", () => {
	const validBody = { email: "test@example.com", password: "Password1" };

	beforeEach(() => {
		mockUser.findUnique.mockResolvedValue(fakeUser);
		verifyPasswordSpy.mockResolvedValue(true);
		mockRefresh.create.mockResolvedValue({
			id: "rt-1",
			token: "rt",
			userId: "user-123",
			companyId: null,
			isRevoked: false,
			expiresAt: new Date(),
			createdAt: new Date(),
		});
	});

	it("200 — returns accessToken and sets refreshToken cookie", async () => {
		const res = await request(app).post("/api/v1/auth/login").send(validBody);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("accessToken");
		expect(res.headers["set-cookie"]).toBeDefined();
	});

	it("401 — wrong password", async () => {
		verifyPasswordSpy.mockResolvedValue(false);
		const res = await request(app).post("/api/v1/auth/login").send(validBody);
		expect(res.status).toBe(401);
	});

	it("401 — user not found", async () => {
		mockUser.findUnique.mockResolvedValue(null);
		const res = await request(app).post("/api/v1/auth/login").send(validBody);
		expect(res.status).toBe(401);
	});

	it("422 — invalid email format", async () => {
		const res = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: "not-an-email", password: "Password1" });
		expect(res.status).toBe(422);
	});
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────

describe("POST /api/v1/auth/logout", () => {
	it("204 — clears cookie even without a token in DB", async () => {
		// Need a valid access token to pass authMiddleware
		// Use a short-lived one signed with the test secret
		const jwt = require("jsonwebtoken");
		const token = jwt.sign(
			{ sub: "user-123", type: "user" },
			process.env["JWT_ACCESS_SECRET"] ?? "test-secret",
			{ expiresIn: "1m" },
		);
		mockRefresh.updateMany.mockResolvedValue({ count: 0 });

		const res = await request(app)
			.post("/api/v1/auth/logout")
			.set("Authorization", `Bearer ${token}`)
			.set("Cookie", "refreshToken=some-rt");

		expect(res.status).toBe(204);
	});
});
