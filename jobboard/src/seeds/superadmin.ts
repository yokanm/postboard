// src/seeds/superadmin.ts
//
// One-time seed script — creates the platform super admin from env vars.
//   npx tsx -r tsconfig-paths/register src/seeds/superadmin.ts
//
// Or add to package.json scripts:
//   "db:seed:super": "tsx -r tsconfig-paths/register src/seeds/superadmin.ts"

import "dotenv/config";
import { seedSuperAdmin } from "@/controller/v1/superadmin/superadmin";
import { connectDb, disconnectDb } from "@/lib/prisma";

(async () => {
	try {
		await connectDb();
		await seedSuperAdmin();
	} catch (err) {
		console.error("❌ Seed failed:", err);
		process.exit(1);
	} finally {
		await disconnectDb();
		process.exit(0);
	}
})();
