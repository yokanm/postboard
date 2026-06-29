// src/types/job.types.ts
//
// Job and tag types: inputs to service functions, shapes returned by services,
// and embedded sub-shapes used in job list and detail responses.

import type { Nullable } from "./common.types";
import type {
	ExperienceLevelType,
	JobStatusType,
	LocationTypeType,
} from "./enums";

// ─── Tag shapes ───────────────────────────────────────────────────────────────

/** Minimal tag embedded in job list items */
export type TagRef = {
	name: string;
	slug: string;
};

/** Full tag with ID — embedded in job detail and tag list */
export type TagFull = {
	id: string;
	name: string;
	slug: string;
};

/** Tag with job usage count — returned by GET /tags */
export type TagWithCount = TagFull & {
	_count: {
		jobs: number;
	};
};

// ─── Posted-by shape ──────────────────────────────────────────────────────────

/** Recruiter who posted the job — embedded in single job detail */
export type PostedByRef = {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
};

// ─── Core job shapes ──────────────────────────────────────────────────────────

/**
 * Job card returned in list responses — lean shape, no description.
 * Includes company and tag refs for display without further requests.
 */
export type JobSummary = {
	id: string;
	title: string;
	slug: string;
	location: Nullable<string>;
	locationType: LocationTypeType;
	salaryMin: Nullable<number>;
	salaryMax: Nullable<number>;
	currency: string;
	status: JobStatusType;
	experienceLevel: ExperienceLevelType;
	expiresAt: Nullable<Date>;
	createdAt: Date;
	company: {
		id: string;
		name: string;
		logoUrl: Nullable<string>;
		slug: string;
	};
	tags: Array<{ tag: TagRef }>;
};

/**
 * Full job detail — includes description, company detail, tags with IDs,
 * and the recruiter who posted it.
 */
export type JobDetail = {
	id: string;
	title: string;
	slug: string;
	description: string;
	location: Nullable<string>;
	locationType: LocationTypeType;
	salaryMin: Nullable<number>;
	salaryMax: Nullable<number>;
	currency: string;
	status: JobStatusType;
	experienceLevel: ExperienceLevelType;
	expiresAt: Nullable<Date>;
	createdAt: Date;
	updatedAt: Date;
	company: {
		id: string;
		name: string;
		slug: string;
		logoUrl: Nullable<string>;
		website: Nullable<string>;
		industry: Nullable<string>;
	};
	tags: Array<{ tag: TagFull }>;
	postedBy: PostedByRef;
};

/** Returned after PATCH /jobs/:id/status */
export type JobStatusUpdated = {
	id: string;
	status: JobStatusType;
	updatedAt: Date;
};

// ─── Service input types ──────────────────────────────────────────────────────

export type CreateJobInput = {
	title: string;
	description: string;
	location?: string;
	locationType?: LocationTypeType;
	salaryMin?: number;
	salaryMax?: number;
	currency?: string;
	experienceLevel?: ExperienceLevelType;
	/** Tag names — upserted automatically */
	tags?: string[];
	/** ISO 8601 date string */
	expiresAt?: string;
};

export type UpdateJobInput = Partial<CreateJobInput>;

export type ListJobsInput = {
	cursor?: string;
	limit?: string;
	status?: string;
	locationType?: string;
	experienceLevel?: string;
	companyId?: string;
	/** Full-text keyword search (Phase 5: tsvector; currently: contains) */
	keyword?: string;
};

export type UpdateJobStatusInput = {
	status: JobStatusType;
};

// ─── Tag service inputs ───────────────────────────────────────────────────────

export type ListTagsInput = {
	/** Partial match for autocomplete */
	q?: string;
	limit?: string;
};
