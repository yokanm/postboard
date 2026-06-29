// src/lib/cache.ts
// Thin wrapper around ioredis for the job listing and detail cache.
// Used exclusively by the jobs service in Phase 6.
//
// TTL STRATEGY:
//   Job listings  → 60s  (changes frequently: new jobs, status changes)
//   Job details   → 300s (changes rarely after creation)
//   Tag listing   → 600s (very stable)
//
// INVALIDATION STRATEGY:
//   - On any job CREATE / UPDATE / DELETE / STATUS-CHANGE: invalidate listing cache (all pages)
//   - On any job UPDATE / DELETE: also invalidate the specific job detail key
//   - We use a simple key prefix pattern so we can scan-and-delete in one go

import redisClient from "@/lib/redis";
import logger from "@/lib/winston";

const PREFIXES = {
	jobList: "cache:jobs:list:",
	jobDetail: "cache:jobs:detail:",
	tagList: "cache:tags:list",
} as const;

// ─── Generic get/set ──────────────────────────────────────────────────────────

export const cacheGet = async <T>(key: string): Promise<T | null> => {
	try {
		const raw = await redisClient.get(key);
		if (!raw) return null;
		return JSON.parse(raw) as T;
	} catch (error) {
		logger.warn("Cache GET error", { key, error });
		return null; // Cache miss on error — degrade gracefully
	}
};

export const cacheSet = async (
	key: string,
	value: unknown,
	ttlSeconds: number,
): Promise<void> => {
	try {
		await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
	} catch (error) {
		logger.warn("Cache SET error", { key, error });
	}
};

export const cacheDel = async (key: string): Promise<void> => {
	try {
		await redisClient.del(key);
	} catch (error) {
		logger.warn("Cache DEL error", { key, error });
	}
};

// ─── Pattern-based invalidation ───────────────────────────────────────────────
// Scans keys matching a prefix and deletes them in one pipeline batch.
// SCAN is non-blocking (unlike KEYS) — safe for production.

export const cacheInvalidatePrefix = async (prefix: string): Promise<void> => {
	try {
		let cursor = "0";
		const keysToDelete: string[] = [];

		do {
			const [nextCursor, keys] = await redisClient.scan(
				cursor,
				"MATCH",
				`${prefix}*`,
				"COUNT",
				"100",
			);
			cursor = nextCursor;
			keysToDelete.push(...keys);
		} while (cursor !== "0");

		if (keysToDelete.length > 0) {
			const pipeline = redisClient.pipeline();
			keysToDelete.forEach((k) => pipeline.del(k));
			await pipeline.exec();
			logger.debug(
				`Cache: invalidated ${keysToDelete.length} key(s) with prefix "${prefix}"`,
			);
		}
	} catch (error) {
		logger.warn("Cache invalidatePrefix error", { prefix, error });
	}
};

// ─── Domain-specific helpers ──────────────────────────────────────────────────

/** Build a deterministic cache key from list query params */
export const buildJobListKey = (
	params: Record<string, string | undefined>,
): string => {
	const sorted = Object.entries(params)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("&");
	return `${PREFIXES.jobList}${sorted}`;
};

export const buildJobDetailKey = (id: string): string =>
	`${PREFIXES.jobDetail}${id}`;

export const buildTagListKey = (): string => PREFIXES.tagList;

/** Invalidate ALL job list pages (called on any job mutation) */
export const invalidateJobLists = (): Promise<void> =>
	cacheInvalidatePrefix(PREFIXES.jobList);

/** Invalidate a single job detail (called on update/delete) */
export const invalidateJobDetail = (id: string): Promise<void> =>
	cacheDel(buildJobDetailKey(id));

export const invalidateTagList = (): Promise<void> =>
	cacheDel(buildTagListKey());

// ─── TTL constants ────────────────────────────────────────────────────────────

export const TTL = {
	JOB_LIST: 60,
	JOB_DETAIL: 300,
	TAG_LIST: 600,
} as const;
