// src/lib/redis.ts
// Single shared Redis client (ioredis) used by:
//   - cache layer (GET /jobs, GET /jobs/:id)
//   - rate-limit-redis store
//   - BullMQ connection
//
// ioredis connects automatically on instantiation and auto-reconnects.
// Do NOT call .connect() manually — it will throw "already connecting/connected".

import Redis from "ioredis";
import config from "@/config";
import logger from "@/lib/winston";

// ─── Shared client ─────────────────────────────────────────────────────────────

const redisClient = new Redis(config.REDIS_URL, {
	maxRetriesPerRequest: null, // required by BullMQ
	enableReadyCheck: false, // prevents boot-time crash if Redis is slow to start
});

redisClient.on("connect", () => logger.info("Redis: connected"));
redisClient.on("ready", () => logger.info("Redis: ready"));
redisClient.on("error", (err) => logger.error("Redis: error", err));
redisClient.on("close", () => logger.warn("Redis: connection closed"));
redisClient.on("reconnecting", () => logger.warn("Redis: reconnecting"));

export const disconnectRedis = async (): Promise<void> => {
	await redisClient.quit();
	logger.info("Redis: disconnected");
};

export default redisClient;

// ─── BullMQ connection factory ─────────────────────────────────────────────────
// BullMQ workers and queues must have their own ioredis connections.
// Call this once per queue/worker at startup.

export const createBullConnection = {
	host: new URL(config.REDIS_URL).hostname,
	port: Number(new URL(config.REDIS_URL).port || 6379),
};
