// src/__tests__/e2e/globalTeardown.ts
// Runs ONCE after the entire E2E test suite finishes.
// Disconnects Prisma and Redis so the Jest process exits cleanly.

export default async function globalTeardown() {
	console.log("\n[E2E] Global teardown complete.");
	// Prisma and Redis clients are disconnected inside e2eSetup.ts afterAll()
	// Nothing else needed here — Node process exits cleanly.
}
