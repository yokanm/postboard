// src/types/enums.ts
//
// Single source of truth for all domain enums.
//
// WHY: Services and controllers previously imported enums directly from
// '../../generated/prisma/client', coupling every file to the generated
// output path. This barrel lets the rest of the app import from '@/types'
// and remain unaffected by Prisma output path changes.
//
// HOW: Re-export the Prisma enum objects (usable as values) AND derive
// TypeScript union types from them (usable as types). Both are exported so
// callers can use whichever form they need.

export {
	ApplicationStatus,
	ExperienceLevel,
	JobStatus,
	LocationType,
	NotificationType,
	UserRole,
} from "../../generated/prisma/client";

// ─── Derived union types ───────────────────────────────────────────────────────
// These mirror the Prisma enums but as plain TypeScript string literal unions.
// Use these in service function signatures, input types, and guards so that
// business logic files don't need to import runtime enum objects.

export type UserRoleType = "ADMIN" | "RECRUITER" | "CANDIDATE";
export type JobStatusType = "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";
export type LocationTypeType = "REMOTE" | "ONSITE" | "HYBRID";
export type ExperienceLevelType = "JUNIOR" | "MID" | "SENIOR" | "LEAD";
export type ApplicationStatusType =
	| "PENDING"
	| "REVIEWED"
	| "SHORTLISTED"
	| "REJECTED"
	| "ACCEPTED";
export type NotificationTypeType =
	| "APPLICATION_RECEIVED"
	| "APPLICATION_STATUS_CHANGED"
	| "JOB_POSTED"
	| "JOB_EXPIRED"
	| "SYSTEM_ALERT";

// ─── State-machine transition maps (typed constants, not enums) ───────────────
// Centralised here so both JobService and ApplicationService reference the
// same transition tables rather than defining their own.

export const JOB_STATUS_TRANSITIONS: Record<JobStatusType, JobStatusType[]> = {
	DRAFT: ["OPEN"],
	OPEN: ["CLOSED"],
	CLOSED: [],
	EXPIRED: [],
};

export const APPLICATION_STATUS_TRANSITIONS: Record<
	ApplicationStatusType,
	ApplicationStatusType[]
> = {
	PENDING: ["REVIEWED", "REJECTED"],
	REVIEWED: ["SHORTLISTED", "REJECTED"],
	SHORTLISTED: ["ACCEPTED", "REJECTED"],
	REJECTED: [],
	ACCEPTED: [],
};

// ─── Role groups (convenience sets for middleware) ─────────────────────────────

/** All roles that are considered company staff */
export const COMPANY_ROLES: UserRoleType[] = ["ADMIN", "RECRUITER"];

/** Roles that can read team data */
export const TEAM_READ_ROLES: UserRoleType[] = ["ADMIN", "RECRUITER"];

/** Roles that can mutate company settings */
export const COMPANY_ADMIN_ROLES: UserRoleType[] = ["ADMIN"];
