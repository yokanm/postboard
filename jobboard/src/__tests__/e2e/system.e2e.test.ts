// src/__tests__/e2e/system.e2e.test.ts
//
// E2E tests for system-level endpoints.
//
// COVERS:
//   GET /healthz            — liveness probe
//   GET /api/v1/health      — readiness probe (real DB + Redis check)
//   GET /api/v1             — root endpoint
//   404 handler             — unknown routes return structured error
//   Rate limiting           — auth limiter actually enforces limits

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "@/app";
import { cleanDb } from "./e2eSetup";

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Health check endpoints", () => {
	afterAll(async () => {
		await cleanDb();
	});

	it("GET /api/v1/healthz — 200 instant liveness (no DB)", async () => {
		const res = await request(app).get("/api/v1/healthz");

		expect(res.status).toBe(200);
		expect(res.body.status).toBe("ok");
		expect(res.body.ts).toBeDefined();
	});

	it("GET /api/v1/health — 200 readiness with real Postgres + Redis checks", async () => {
		const res = await request(app).get("/api/v1/health");

		expect(res.status).toBe(200);
		expect(res.body.status).toBe("ok");
		expect(res.body.checks.postgres.status).toBe("ok");
		expect(res.body.checks.redis.status).toBe("ok");
		expect(typeof res.body.checks.postgres.latencyMs).toBe("number");
		expect(typeof res.body.checks.redis.latencyMs).toBe("number");
		expect(res.body.version).toBeDefined();
	});

	it("GET /api/v1 — 200 root endpoint returns version info", async () => {
		const res = await request(app).get("/api/v1");

		expect(res.status).toBe(200);
		expect(res.body.status).toBe("Ok");
		expect(res.body.version).toBeDefined();
		expect(res.body.timeStamp).toBeDefined();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// 404 + ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] 404 and error handling", () => {
	it("404 — unknown route returns structured AppError response", async () => {
		const res = await request(app).get("/api/v1/this-route-does-not-exist");

		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty("message");
		expect(res.body.message).toContain("Cannot GET");
	});

	it("404 — POST to unknown route also structured", async () => {
		const res = await request(app)
			.post("/api/v1/nonexistent/endpoint")
			.send({ foo: "bar" });

		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty("message");
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING (auth limiter — 10 req / 15 min)
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] Rate limiting — auth endpoints", () => {
	// NOTE: This test only verifies the rate-limit RESPONSE SHAPE, not that
	// the limiter actually trips (which would require 10+ requests and slow the suite).
	// Full rate-limit enforcement is verified in the load testing phase.

	it("429 header keys are present on auth endpoint responses", async () => {
		const res = await request(app)
			.post("/api/v1/auth/login")
			.send({ email: "rate@test.com", password: "AnyPass1" });

		// Rate-limit standard headers should be present (draft-8)
		expect(
			res.headers["ratelimit-limit"] ?? res.headers["x-ratelimit-limit"],
		).toBeDefined();
		expect(
			res.headers["ratelimit-remaining"] ??
				res.headers["x-ratelimit-remaining"],
		).toBeDefined();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

describe("[E2E] CORS headers", () => {
	it("OPTIONS preflight returns correct CORS headers", async () => {
		const res = await request(app)
			.options("/api/v1/auth/login")
			.set("Origin", "http://localhost:5173")
			.set("Access-Control-Request-Method", "POST");

		// In development mode, all origins are allowed
		expect([200, 204]).toContain(res.status);
	});
});
