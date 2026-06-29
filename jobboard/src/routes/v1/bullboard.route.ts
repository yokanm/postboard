// src/routes/v1/bullboard.route.ts
// Exposes a Bull Board UI at /admin/queues — protected by a simple API key
// check (or swap in your authMiddleware for production).
//
// Bull Board gives you a real-time view of:
//   - Active, waiting, completed, failed jobs per queue
//   - Job data, stack traces, retry counts
//   - Manual retry / delete of failed jobs
//
// INSTALL the extra packages if not already present:
//   npm install @bull-board/api @bull-board/express

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Router } from "express";
import logger from "@/lib/winston";
import { adminsAuth } from "@/middleware/adminsAuth";
import { emailQueue } from "@/queues";

const router = Router();

// ─── Auth guard ────────────────────────────────────────────────────────────────
// Simple header check. Replace with your admin authMiddleware in production.
// Set BULL_BOARD_PASSWORD in your .env file.

// ─── Bull Board setup ──────────────────────────────────────────────────────────

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
	queues: [new BullMQAdapter(emailQueue)],
	serverAdapter,
});

// Protect the dashboard in all environments
router.use("/", adminsAuth, serverAdapter.getRouter());

logger.info("Bull Board: dashboard registered at /admin/queues (admin-only)");

export default router;
