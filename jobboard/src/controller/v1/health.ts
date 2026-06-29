// src/controller/v1/health.ts
// Phase 10: Health and readiness check endpoints.
//
// /health        — liveness:  is the process up?        (always 200)
// /ready         — readiness: are DB + Redis reachable?  (200 or 503)
// /queue/health  — BullMQ queue counts (NEW – BUG-9)
//
// PATCH (BUG-9): Added GET /queue/health which returns the four standard
// BullMQ counters.  The endpoint is mounted at app-level (not under /api/v1)
// so it is reachable even if the versioned router fails.

import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "@/lib/prisma";
import redisClient from "@/lib/redis";
import logger from "@/lib/winston";
import { emailQueue } from "@/queues";

// ─── Liveness ──────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Always returns 200 if the Node process is alive.
 * Kubernetes liveness probes should point here.
 */
const livenessHandler = (_req: Request, res: Response): void => {
	res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString(),
		uptime: Math.floor(process.uptime()),
	});
};

// ─── Readiness ─────────────────────────────────────────────────────────────────

/**
 * GET /ready
 * Checks DB and Redis connectivity.
 * Returns 200 only when all dependencies are reachable.
 */
const readinessHandler = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const checks: Record<
		string,
		{ status: "ok" | "error"; latencyMs?: number; error?: string }
	> = {};
	let allOk = true;

	// ─── PostgreSQL ──────────────────────────────────────────────────────────────
	const dbStart = Date.now();
	try {
		await prisma.$queryRaw`SELECT 1`;
		checks["postgres"] = { status: "ok", latencyMs: Date.now() - dbStart };
	} catch (err: unknown) {
		allOk = false;
		checks["postgres"] = {
			status: "error",
			latencyMs: Date.now() - dbStart,
			error: err instanceof Error ? err.message : String(err),
		};
		logger.error("Readiness: postgres check failed", err);
	}

	// ─── Redis ───────────────────────────────────────────────────────────────────
	const redisStart = Date.now();
	try {
		await redisClient.ping();
		checks["redis"] = { status: "ok", latencyMs: Date.now() - redisStart };
	} catch (err: unknown) {
		allOk = false;
		checks["redis"] = {
			status: "error",
			latencyMs: Date.now() - redisStart,
			error: err instanceof Error ? err.message : String(err),
		};
		logger.error("Readiness: redis check failed", err);
	}

	res.status(allOk ? 200 : 503).json({
		status: allOk ? "ok" : "degraded",
		timestamp: new Date().toISOString(),
		checks,
	});
};

// ─── Queue health (NEW) ────────────────────────────────────────────────────────

/**
 * GET /queue/health
 * Returns live BullMQ counts for the email-queue.
 * Use this to verify jobs are flowing through the pipeline.
 *
 * Example response:
 *   {
 *     "queue": {
 *       "waiting":   0,
 *       "active":    1,
 *       "completed": 42,
 *       "failed":    0
 *     }
 *   }
 */
const queueHealthHandler = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const [waiting, active, completed, failed] = await Promise.all([
			emailQueue.getWaitingCount(),
			emailQueue.getActiveCount(),
			emailQueue.getCompletedCount(),
			emailQueue.getFailedCount(),
		]);

		res.status(200).json({
			queue: { waiting, active, completed, failed },
		});
	} catch (err: unknown) {
		logger.error("Queue health check failed", err);
		res.status(503).json({
			queue: {
				status: "unavailable",
				error: err instanceof Error ? err.message : String(err),
			},
		});
	}
};

// ─── Router ────────────────────────────────────────────────────────────────────

const healthRouter = Router();
healthRouter.get("/health", livenessHandler);
healthRouter.get("/ready", readinessHandler);
healthRouter.get("/queue/health", queueHealthHandler); // NEW

export default healthRouter;
