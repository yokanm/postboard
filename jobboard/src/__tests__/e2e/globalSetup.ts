// src/__tests__/e2e/globalSetup.ts
// Runs ONCE before the entire E2E test suite starts.
//
// Responsibilities:
//   1. Validate that DATABASE_URL_TEST is set (never contaminate dev DB)
//   2. Connect to the test database and apply all Prisma migrations
//   3. Connect to Redis and flush the test keyspace
//
// This file runs in its own Node process (Jest globalSetup constraint),
// so it cannot share module state with the test files themselves.

import { execSync } from "child_process";

export default async function globalSetup() {
	// ── Guard: require a dedicated test database ──────────────────────────────
	// We default to DATABASE_URL_TEST, fall back to DATABASE_URL only if it
	// contains the word "test" in the database name — prevents accidents.
	const testDbUrl =
		process.env["DATABASE_URL_TEST"] ?? process.env["DATABASE_URL"];

	if (!testDbUrl) {
		throw new Error(
			"[E2E] DATABASE_URL_TEST is not set.\n" +
				"Create a separate test database and set DATABASE_URL_TEST in your .env.test file.\n" +
				"Example: DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5432/job_board_test",
		);
	}

	const isTestDb =
		testDbUrl.includes("_test") ||
		testDbUrl.includes("test_") ||
		testDbUrl.includes("/test");

	if (!isTestDb) {
		throw new Error(
			"[E2E] DATABASE_URL_TEST does not appear to be a test database.\n" +
				'The database name must contain "test" to prevent accidental data loss.\n' +
				`Got: ${testDbUrl}`,
		);
	}

	// ── Override DATABASE_URL for this process tree ───────────────────────────
	process.env["DATABASE_URL"] = testDbUrl;

	// ── Apply Prisma migrations to the test DB ────────────────────────────────
	console.log("\n[E2E] Applying Prisma migrations to test database...");
	try {
		execSync("npx prisma migrate deploy", {
			env: { ...process.env, DATABASE_URL: testDbUrl },
			stdio: "pipe",
		});
		console.log("[E2E] Migrations applied successfully.\n");
	} catch (err) {
		console.error("[E2E] Migration failed:", err);
		throw err;
	}
}
