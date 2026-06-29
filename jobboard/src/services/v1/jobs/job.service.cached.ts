// src/services/v1/jobs/job.service.cached.ts
// Drop-in replacements for listJobsService and getJobService that add
// Redis caching. Import from here instead of job.service.ts in job.ts controller.
//
// CACHE STRATEGY:
//   listJobsService → 60s TTL; invalidated on any job mutation
//   getJobService   → 300s TTL; invalidated on update/delete of that specific job
//
// All other service functions (create, update, delete, status) call the
// invalidation helpers so the cache stays consistent.
//
// NOTE: This file re-exports everything from job.service.ts so the controller
// only needs to change its import path — nothing else changes.

export {
	createJobService,
	deleteJobService,
	updateJobService,
	updateJobStatusService,
} from "./job.service";

import {
	buildJobDetailKey,
	buildJobListKey,
	cacheGet,
	cacheSet,
	invalidateJobDetail,
	invalidateJobLists,
	TTL,
} from "@/lib/cache";
import logger from "@/lib/winston";
import type { ListJobsInput } from "@/types";
import {
	getJobService as _getJobService,
	listJobsService as _listJobsService,
} from "./job.service";

// ─── Cached list ───────────────────────────────────────────────────────────────

export const listJobsService = async (input: ListJobsInput) => {
	const key = buildJobListKey(input as Record<string, string | undefined>);

	const cached =
		await cacheGet<Awaited<ReturnType<typeof _listJobsService>>>(key);
	if (cached) {
		logger.debug("Cache HIT: job list", { key });
		return cached;
	}

	const result = await _listJobsService(input);
	void cacheSet(key, result, TTL.JOB_LIST);
	logger.debug("Cache MISS: job list", { key });
	return result;
};

// ─── Cached detail ─────────────────────────────────────────────────────────────

export const getJobService = async (id: string) => {
	const key = buildJobDetailKey(id);

	const cached =
		await cacheGet<Awaited<ReturnType<typeof _getJobService>>>(key);
	if (cached) {
		logger.debug("Cache HIT: job detail", { id });
		return cached;
	}

	const result = await _getJobService(id);
	void cacheSet(key, result, TTL.JOB_DETAIL);
	logger.debug("Cache MISS: job detail", { id });
	return result;
};

// ─── Invalidation wrappers ─────────────────────────────────────────────────────
// Re-export these so the controller or service can call them when mutations happen.
// Already called inside the service functions themselves — exported for convenience.

export { invalidateJobLists, invalidateJobDetail };
