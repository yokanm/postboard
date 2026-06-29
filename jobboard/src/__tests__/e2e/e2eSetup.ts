// src/__tests__/e2e/e2eSetup.ts
// Runs before each E2E test FILE (setupFilesAfterFramework in jest.e2e.config.ts).
//
// Provides:
//   - cleanDb()      — truncates all tables in dependency order
//   - getAuthToken() — registers + logs in a user, returns the access token
//   - seedJob()      — creates a company, admin user, and an OPEN job
//
// Import these helpers directly in your E2E test files:
//   import { cleanDb, getAuthToken } from '../e2eSetup';

/// <reference types="jest" />
import { PrismaPg } from "@prisma/adapter-pg";
import Redis from "ioredis";
import request from "supertest";
import app from "@/app";
import { PrismaClient } from "../../../generated/prisma/client";

// ─── Shared clients (one per worker process) ──────────────────────────────────
const adapter = new PrismaPg({
	connectionString: process.env["DATABASE_URL"]!,
});
export const db = new PrismaClient({ adapter });
export const redis = new Redis(
	process.env["REDIS_URL"] ?? "redis://localhost:6379",
	{
		maxRetriesPerRequest: null,
		lazyConnect: true,
	},
);

// ─── Connect once per test file ───────────────────────────────────────────────
beforeAll(async () => {
	await db.$connect();
	await redis.connect().catch(() => {}); // ignore if already connected
});

afterAll(async () => {
	await db.$disconnect();
	await redis.quit().catch(() => {});
});

// ─── Table truncation ─────────────────────────────────────────────────────────
// Order matters — foreign key constraints must be respected.
// We truncate in reverse dependency order.

export const cleanDb = async (): Promise<void> => {
	// Prisma doesn't expose raw truncate as a typed method, so use $executeRaw
	await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      ai_usage,
      notifications,
      job_application,
      job_tags,
      jobs,
      refresh_token,
      user_profiles,
      users,
      tags,
      companies
    RESTART IDENTITY CASCADE
  `);

	// Also flush the Redis test keyspace so cache/rate-limit state is clean
	await redis.flushdb();
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export type RegisteredUser = {
	accessToken: string;
	userId: string;
	email: string;
	password: string;
};

/**
 * Registers a new user via the real API and returns the access token.
 * Use this to get a valid Bearer token for subsequent authenticated requests.
 */
export const registerAndLogin = async (overrides?: {
	email?: string;
	password?: string;
	userName?: string;
	role?: "CANDIDATE" | "RECRUITER";
}): Promise<RegisteredUser> => {
	const email = overrides?.email ?? `user_${Date.now()}@example.com`;
	const password = overrides?.password ?? "TestPass1";
	const userName = overrides?.userName ?? `user_${Date.now()}`;

	const res = await request(app)
		.post("/api/v1/auth/register")
		.send({
			userName,
			firstName: "Test",
			lastName: "User",
			email,
			password,
			role: overrides?.role ?? "CANDIDATE",
		});

	if (res.status !== 201) {
		throw new Error(
			`[e2eSetup] registerAndLogin failed: ${JSON.stringify(res.body)}`,
		);
	}

	return {
		accessToken: res.body.accessToken as string,
		userId: res.body.user.id as string,
		email,
		password,
	};
};

export type RegisteredCompany = {
	companyId: string;
	adminUserId: string;
	adminAccessToken: string;
	adminEmail: string;
	adminPassword: string;
	companyEmail: string;
};

/**
 * Registers a company + admin user via the real API, then logs in as the admin
 * to get a valid Bearer token.
 */
export const registerCompanyAndLogin = async (overrides?: {
	companyName?: string;
}): Promise<RegisteredCompany> => {
	const ts = Date.now();
	const companyName = overrides?.companyName ?? `TestCo ${ts}`;
	const adminEmail = `admin_${ts}@testco.com`;
	const adminPass = "AdminPass1";

	const res = await request(app)
		.post("/api/v1/auth/register/company")
		.send({
			companyName,
			companyEmail: `corp_${ts}@testco.com`,
			companyPassword: "CorpPass1",
			userName: `admin_${ts}`,
			firstName: "Admin",
			lastName: "User",
			userEmail: adminEmail,
			userPassword: adminPass,
		});

	if (res.status !== 201) {
		throw new Error(
			`[e2eSetup] registerCompanyAndLogin failed: ${JSON.stringify(res.body)}`,
		);
	}

	const { companyId, userId } = res.body as {
		companyId: string;
		userId: string;
	};

	// Login as the admin user to get an access token with companyId embedded
	const loginRes = await request(app).post("/api/v1/auth/login").send({
		email: adminEmail,
		password: adminPass,
	});

	if (loginRes.status !== 200) {
		throw new Error(
			`[e2eSetup] admin login failed: ${JSON.stringify(loginRes.body)}`,
		);
	}

	return {
		companyId,
		adminUserId: userId,
		adminAccessToken: loginRes.body.accessToken as string,
		adminEmail,
		adminPassword: adminPass,
		companyEmail: `corp_${ts}@testco.com`,
	};
};

/**
 * Creates an OPEN job under the given company admin.
 * Returns the job ID.
 */
export const createOpenJob = async (
	adminToken: string,
	overrides?: { title?: string; tags?: string[] },
): Promise<string> => {
	const res = await request(app)
		.post("/api/v1/job")
		.set("Authorization", `Bearer ${adminToken}`)
		.send({
			title: overrides?.title ?? "Software Engineer",
			description:
				"We are looking for an experienced engineer to join our team and help build scalable backend systems.",
			locationType: "REMOTE",
			experienceLevel: "MID",
			salaryMin: 50000,
			salaryMax: 90000,
			currency: "USD",
			tags: overrides?.tags ?? ["Node.js", "TypeScript"],
		});

	if (res.status !== 201) {
		throw new Error(
			`[e2eSetup] createOpenJob failed: ${JSON.stringify(res.body)}`,
		);
	}

	const jobId = res.body.job.id as string;

	// Transition DRAFT → OPEN
	const statusRes = await request(app)
		.patch(`/api/v1/job/${jobId}/status`)
		.set("Authorization", `Bearer ${adminToken}`)
		.send({ status: "OPEN" });

	if (statusRes.status !== 200) {
		throw new Error(
			`[e2eSetup] job status transition failed: ${JSON.stringify(statusRes.body)}`,
		);
	}

	return jobId;
};
