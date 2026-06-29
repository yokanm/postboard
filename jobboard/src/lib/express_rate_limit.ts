// LIMITS:
//   Global          → 100 req / 15 min
//   Auth (login/forgot-password/reset) → 10 req / 15 min  (brute-force guard)
//   Apply to job    → 10 req / 1 min   (prevents application spam)
//   Job listing     → 200 req / 1 min  (high-traffic public endpoint)

import rateLimit from "express-rate-limit";
import { type RedisReply, RedisStore } from "rate-limit-redis";
import redisClient from "@/lib/redis";

/**
 * Helper: build a RedisStore for a given key prefix.
 */

const makeRedisStore = (prefix: string) =>
	new RedisStore({
		// rate-limit-redis v4 uses sendCommand for ioredis compatibility
		sendCommand: (...args: string[]) =>
			redisClient.call(
				...(args as [string, ...string[]]),
			) as Promise<RedisReply>,
		prefix,
	});

/**
 * Default limiter applied globally to all routes.
 * 100 requests per 15-minute window.
 */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	store: makeRedisStore("rl:global:"),
	message: {
		error: {
			code: "RATE_LIMITED",
			message: "Too many requests. Try again later.",
		},
	},
});

/**
 * Strict limiter for brute-force-sensitive auth endpoints:
 * login, forgot-password, reset-password.
 * 10 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	store: makeRedisStore("rl:auth:"),
	message: {
		error: {
			code: "RATE_LIMITED",
			message: "Too many attempts. Please try again in 15 minutes.",
		},
	},
});

/**
 * Apply - to - job limiter
 * Applied to: POST /jobs/:id/apply
 * Prevents candidates from bulk-spamming applications.
 */

export const applyLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	store: makeRedisStore("rl:apply:"),
	message: {
		error: {
			code: "RATE_LIMITED",
			message: "Too many applications in a short period. Please slow down.",
		},
	},
});

/**
 * Job listing limiter
 * Applied to: GET /jobs (public, high-traffic)
 */
export const jobListLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 200,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	store: makeRedisStore("rl:joblist:"),
	message: {
		error: {
			code: "RATE_LIMITED",
			message: "Rate limit exceeded. Try again shortly.",
		},
	},
});

export default limiter;
