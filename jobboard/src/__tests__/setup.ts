// src/__tests__/setup.ts
//
// Global Jest setup — loaded via `setupFiles` in jest.config.ts.
// Every module that touches a network, filesystem, or external service is
// mocked here so tests run fast and hermetically.
//
// ─────────────────────────────────────────────────────────────────────────────
// ORDER MATTERS: jest.mock() calls are hoisted by Babel/ts-jest to the top of
// the file, but the factory functions run at parse time — before any imports.
// Keep factories self-contained (no references to outer-scope variables).
// ─────────────────────────────────────────────────────────────────────────────

import { jest } from "@jest/globals";

// ─── Prisma mock ──────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
	prisma: {
		user: mockModel(),
		company: mockModel(),
		userProfile: mockModel(),
		job: mockModel(),
		jobApplication: mockModel(),
		tag: mockModel(),
		jobTag: mockModel(),
		refreshToken: mockModel(),
		notification: mockModel(),
		adminAuditLog: mockModel(), // ← required by admin.service.ts
		$transaction: jest
			.fn<(ops: unknown) => Promise<unknown>>()
			.mockImplementation(async (ops: unknown) => {
				if (typeof ops === "function") {
					return (ops as (client: unknown) => Promise<unknown>)(
						mockPrismaClient,
					);
				}
				return Promise.all(ops as Promise<unknown>[]);
			}),
		$connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
		$disconnect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	},
}));

// ─── Redis mock ────────────────────────────────────────────────────────────────

jest.mock("@/lib/redis", () => ({
	default: {
		get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
		set: jest.fn<() => Promise<string>>().mockResolvedValue("OK"),
		del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
		scan: jest
			.fn<() => Promise<[string, string[]]>>()
			.mockResolvedValue(["0", []]),
		call: jest.fn<() => Promise<null>>().mockResolvedValue(null),
		quit: jest.fn<() => Promise<string>>().mockResolvedValue("OK"),
		connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
		on: jest.fn<() => void>(),
		pipeline: jest.fn<() => object>().mockReturnValue({
			del: jest.fn<() => void>(),
			exec: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
		}),
	},
	__esModule: true,
	connectRedis: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	disconnectRedis: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	createBullConnection: jest.fn<() => object>().mockReturnValue({
		on: jest.fn<() => void>(),
		quit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	}),
}));

// ─── Email mock ────────────────────────────────────────────────────────────────

jest.mock("@/lib/email", () => ({
	sendEmail: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	verificationEmailHtml: jest
		.fn<() => string>()
		.mockReturnValue("<html>verify</html>"),
	passwordResetEmailHtml: jest
		.fn<() => string>()
		.mockReturnValue("<html>reset</html>"),
	companyVerificationEmailHtml: jest
		.fn<() => string>()
		.mockReturnValue("<html>company-verify</html>"),
}));

// ─── Cloudinary mock ───────────────────────────────────────────────────────────

jest.mock("@/lib/cloudinary", () => ({
	__esModule: true,
	uploadToCloudinary: jest
		.fn<() => Promise<{ url: string; publicId: string }>>()
		.mockResolvedValue({
			url: "https://res.cloudinary.com/test/image.jpg",
			publicId: "test/image",
		}),
	deleteFromCloudinary: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
}));

// ─── BullMQ queue mock ─────────────────────────────────────────────────────────

jest.mock("@/queues", () => ({
	emailQueue: {
		add: jest
			.fn<() => Promise<{ id: string }>>()
			.mockResolvedValue({ id: "job-1" }),
	},
	enqueueApplicationReceivedEmail: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	enqueueApplicationStatusEmail: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	enqueueJobExpiredEmail: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
}));

// ─── Notification mock ─────────────────────────────────────────────────────────

jest.mock("@/lib/notification", () => ({
	notifyApplicationReceived: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	notifyApplicationStatusChanged: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	notifyJobPosted: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

// ─── Cache mock ────────────────────────────────────────────────────────────────
// admin.service.ts imports invalidateJobLists / invalidateJobDetail from cache.
// notification.service.ts imports cacheGet / cacheSet / cacheDel.
// Without this mock the cache module tries to connect to Redis at import time.

jest.mock("@/lib/cache", () => ({
	// Generic key-value helpers (used by notification service)
	__esModule: true,
	cacheGet: jest.fn<() => Promise<null>>().mockResolvedValue(null),
	cacheSet: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	cacheDel: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	cacheInvalidatePrefix: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	// Job-specific helpers (used by job and admin services)
	invalidateJobLists: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	invalidateJobDetail: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	invalidateTagList: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	getCachedJobList: jest.fn<() => Promise<null>>().mockResolvedValue(null),
	setCachedJobList: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
	getCachedJobDetail: jest.fn<() => Promise<null>>().mockResolvedValue(null),
	setCachedJobDetail: jest
		.fn<() => Promise<void>>()
		.mockResolvedValue(undefined),
	buildJobListKey: jest.fn<() => string>().mockReturnValue("jobs:list:"),
	buildJobDetailKey: jest.fn<() => string>().mockReturnValue("jobs:detail:"),
	buildTagListKey: jest.fn<() => string>().mockReturnValue("tags:list"),
	TTL: { jobList: 60, jobDetail: 300, tagList: 600 },
}));

// ─── Rate-limit mock ───────────────────────────────────────────────────────────
// express-rate-limit tries to connect to Redis via rate-limit-redis in tests.
// Replace the entire module with pass-through middleware so routes work.

jest.mock("@/lib/express_rate_limit", () => {
	// A no-op Express middleware factory
	const passThrough = () => (_req: unknown, _res: unknown, next: () => void) =>
		next();

	return {
		default: passThrough(), // the global limiter (default export)
		authLimiter: passThrough(), // auth-specific limiter
		applyLimiter: passThrough(), // job application limiter
		jobLimiter: passThrough(), // job listing limiter
	};
});

// ─── Swagger / Bull-Board mock ─────────────────────────────────────────────────
// These modules are imported by app.ts. They pull in heavy deps (swagger-jsdoc,
// swagger-ui-express, @bull-board/*) that can fail or take forever in tests.

jest.mock("@/lib/swagger", () => ({
	mountSwagger: jest.fn<() => void>(),
}));

jest.mock("@/routes/v1/bullboard.route", () => {
	const { Router } = jest.requireActual<typeof import("express")>("express");
	return { default: Router() };
});

// ─── Helper ────────────────────────────────────────────────────────────────────
// Every model method is typed as `() => Promise<unknown>` so `.mockResolvedValue()`
// accepts any concrete value without collapsing to `never`.

function mockModel() {
	return {
		findUnique: jest.fn<() => Promise<unknown>>(),
		findMany: jest.fn<() => Promise<unknown>>(),
		findFirst: jest.fn<() => Promise<unknown>>(),
		create: jest.fn<() => Promise<unknown>>(),
		createMany: jest.fn<() => Promise<unknown>>(),
		update: jest.fn<() => Promise<unknown>>(),
		updateMany: jest.fn<() => Promise<unknown>>(),
		upsert: jest.fn<() => Promise<unknown>>(),
		delete: jest.fn<() => Promise<unknown>>(),
		deleteMany: jest.fn<() => Promise<unknown>>(),
		count: jest.fn<() => Promise<number>>(),
		aggregate: jest.fn<() => Promise<unknown>>(),
	};
}

export const mockPrismaClient = {
	user: mockModel(),
	company: mockModel(),
	userProfile: mockModel(),
	job: mockModel(),
	jobApplication: mockModel(),
	tag: mockModel(),
	jobTag: mockModel(),
	refreshToken: mockModel(),
	notification: mockModel(),
	adminAuditLog: mockModel(),
};
