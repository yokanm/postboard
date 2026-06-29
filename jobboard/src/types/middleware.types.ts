// src/types/middleware.types.ts
//
// Types for Express middleware — auth request extensions, role guards,
// and cookie configuration. These live here (not in authentication.ts)
// so services can reference AuthRoles without importing middleware files.

import type { Request } from "express";
import type { UserRoleType } from "./enums";

// ─── Authenticated request ────────────────────────────────────────────────────

/**
 * Extends Express Request with fields populated by authMiddleware.
 * All three fields come from the decoded JWT — no extra DB round-trips.
 *
 *   userId    — the user.id (or company.id for company-only tokens)
 *   companyId — embedded at login; authorizeCompany reads this directly
 *   role      — embedded at login; re-validated from DB on mutations only
 */
export interface AuthRequest extends Request {
	userId?: string;
	companyId?: string | null;
	role?: string | null;
}

// ─── Role guards ──────────────────────────────────────────────────────────────

/** All valid role strings — used by authorize() and authorizeCompany() */
export type AuthRoles = UserRoleType;

// ─── Cookie options ───────────────────────────────────────────────────────────

export type RefreshCookieOptions = {
	httpOnly: true;
	secure: boolean;
	sameSite: "strict";
	maxAge: number;
};

/** Standard 7-day refresh token cookie options */
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
