// src/types/user.types.ts
//
// User account and profile types. Covers three concerns:
//   1. Service input types (what functions accept)
//   2. DB projection types (what Prisma select/include returns)
//   3. Response types (what controllers send to clients)

import type { Nullable, Timestamps } from "./common.types";
import type { UserRoleType } from "./enums";

// ─── Core user shapes ─────────────────────────────────────────────────────────

/**
 * Minimal public user — safe to send in any response, never includes password.
 * Used in auth responses (register, login).
 */
export type UserPublic = {
	id: string;
	userName: string;
	email: string;
	role: UserRoleType;
	isVerified: boolean;
};

/** Summary shown on login — no id exposed */
export type UserSummary = {
	userName: string;
	email: string;
	role: UserRoleType;
};

/** Full user returned by GET /user/current */
export type UserWithProfile = {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: Nullable<string>;
	role: UserRoleType;
	isVerified: boolean;
	companyId: Nullable<string>;
	createdAt: Date;
	profile: UserProfileData | null;
};

/** The nested profile shape within UserWithProfile */
export type UserProfileData = {
	bio: Nullable<string>;
	resumeUrl: Nullable<string>;
	linkedinUrl: Nullable<string>;
	githubUrl: Nullable<string>;
	skills: string[];
	location: Nullable<string>;
};

/** Returned after PATCH /user/current */
export type UserUpdated = Pick<
	UserWithProfile,
	"id" | "userName" | "firstName" | "lastName" | "email" | "phone" | "role"
> & {
	updatedAt: Date;
};

/** Team member row — richer than UserPublic, used in team listing */
export type TeamMemberRow = {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	role: UserRoleType;
	isVerified: boolean;
	createdAt: Date;
};

/** Compact member returned after invite / role update */
export type TeamMemberSummary = {
	id: string;
	userName: string;
	email: string;
	role: UserRoleType;
};

// ─── Service input types ──────────────────────────────────────────────────────

export type UpdateUserInput = {
	firstName?: string;
	lastName?: string;
	userName?: string;
	phone?: string;
};

export type UpsertProfileInput = {
	bio?: string;
	linkedinUrl?: string;
	githubUrl?: string;
	skills?: string[];
	location?: string;
};

// ─── Service return types ─────────────────────────────────────────────────────

export type ResumeUploadResult = {
	resumeUrl: string | null;
};

/**
 * Applicant summary embedded in application list items (recruiter view).
 * Includes a partial profile so the recruiter can see skills/location without
 * a separate request.
 */
export type ApplicantSummary = {
	id: string;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		resumeUrl: Nullable<string>;
		skills: string[];
		location: Nullable<string>;
	} | null;
};
