// src/types/company.types.ts
//
// Company profile, logo, and team management types.

import type { Nullable, Timestamps } from "./common.types";

// ─── Core company shapes ──────────────────────────────────────────────────────

/** Minimal company reference embedded in job listings */
export type CompanyRef = {
	id: string;
	name: string;
	slug: string;
	logoUrl: Nullable<string>;
};

/** Company reference in a single job detail — includes extra fields */
export type CompanyDetailRef = {
	id: string;
	name: string;
	slug: string;
	logoUrl: Nullable<string>;
	website: Nullable<string>;
	industry: Nullable<string>;
};

/** Minimal company info returned on company login */
export type CompanySummary = {
	id: string;
	name: string;
	email: string;
};

/**
 * Full company profile returned by GET /company/current.
 * Includes aggregate counts for jobs and users.
 */
export type CompanyProfile = {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: Nullable<string>;
	website: Nullable<string>;
	industry: Nullable<string>;
	size: Nullable<string>;
	isVerified: boolean;
	createdAt: Date;
	_count: {
		jobs: number;
		users: number;
	};
};

/** Returned after PATCH /company/current */
export type CompanyUpdated = {
	id: string;
	name: string;
	slug: string;
	email: string;
	logoUrl: Nullable<string>;
	website: Nullable<string>;
	industry: Nullable<string>;
	size: Nullable<string>;
	isVerified: boolean;
	updatedAt: Date;
};

/** Returned after POST /company/current/logo */
export type CompanyLogoResult = {
	logoUrl: string | null;
};

// ─── Service input types ──────────────────────────────────────────────────────

export type UpdateCompanyInput = {
	name?: string;
	website?: string;
	industry?: string;
	/** Must be one of the allowed size bands */
	size?:
		| "1-10"
		| "11-50"
		| "51-200"
		| "201-500"
		| "501-1000"
		| "1000+"
		| string;
};

/**
 * Options for getCompanyProfile — either an explicit companyId (from route
 * param) or derive it from the authenticated userId.
 */
export type GetCompanyProfileOpts = {
	companyId?: string;
	userId?: string;
};

// ─── Team input types ─────────────────────────────────────────────────────────

export type InviteTeamMemberInput = {
	email: string;
	role?: "RECRUITER" | "CANDIDATE";
};

export type UpdateTeamMemberRoleInput = {
	role: "ADMIN" | "RECRUITER" | "CANDIDATE";
};
