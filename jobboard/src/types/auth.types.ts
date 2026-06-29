// src/types/auth.types.ts
//
// All authentication-related input and output types.
// AuthService functions accept these inputs and return these outputs.
// Controllers use them for request body typing and response shaping.

import type { UserRoleType } from "./enums";

// ─── JWT / Token types ────────────────────────────────────────────────────────

/**
 * Payload embedded in both access and refresh tokens.
 * companyId and role are embedded at login so middleware avoids extra DB calls.
 */
export type TokenPayload = {
	/** The user.id or company.id this token was issued for */
	userId: string | undefined;
	/** Embedded so authorizeCompany doesn't need a DB lookup per request */
	companyId?: string | null;
	/** Embedded for fast role checks; re-validated from DB on mutations */
	role?: string | null;
};

/** The pair returned after any successful auth (login, register, token rotation) */
export type TokenPair = {
	accessToken: string;
	refreshToken: string;
};

/** Options passed to token generators */
export type TokenGeneratorOpts = {
	companyId?: string | null;
	role?: string | null;
};

// ─── Register inputs ──────────────────────────────────────────────────────────

export type RegisterUserInput = {
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: "RECRUITER" | "CANDIDATE";
	phone?: string;
	/** If provided, user is immediately attached to this company */
	companyId?: string;
};

export type RegisterCompanyInput = {
	companyName: string;
	companyEmail: string;
	companyPassword: string;
	/** Admin user fields (created atomically with the company) */
	userName: string;
	firstName: string;
	lastName: string;
	userEmail: string;
	userPassword: string;
};

// ─── Login inputs ─────────────────────────────────────────────────────────────

export type LoginInput = {
	email: string;
	password: string;
};

// ─── Password inputs ──────────────────────────────────────────────────────────

export type ChangePasswordInput = {
	currentPassword: string;
	newPassword: string;
};

export type ResetPasswordInput = {
	/** Token from the reset email */
	token: string;
	password: string;
};

// ─── Service return shapes ────────────────────────────────────────────────────
// What AuthService functions return — controllers spread these into responses.

export type RegisterUserResult = {
	user: {
		id: string;
		userName: string;
		email: string;
		role: UserRoleType;
		isVerified: boolean;
	};
};

export type RegisterCompanyResult = {
	companyId: string;
	userId: string;
};

export type LoginUserResult = TokenPair & {
	user: {
		userName: string;
		email: string;
		role: UserRoleType;
	};
};

export type LoginCompanyResult = TokenPair & {
	company: {
		id: string;
		name: string;
		email: string;
	};
};
