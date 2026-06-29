// src/lib/tokenHash.ts
//
// Single-purpose utility for hashing refresh tokens before they are
// written to PostgreSQL. Using SHA-256 via Node's built-in crypto module
// means no additional dependencies and deterministic output.
//
// DESIGN:
//   • Raw token → client (cookie / JSON body)
//   • hashToken(rawToken) → database
//   • On every lookup: hash the incoming value, then query by hash
//
// SHA-256 is appropriate here because:
//   1. Refresh tokens are already high-entropy random strings (≥256 bits).
//      bcrypt's slowness is needed for low-entropy passwords — not here.
//   2. Deterministic hashing allows equality lookups without secret keys.
//   3. Even if the DB is compromised, an attacker gains only hashes that
//      cannot be reversed into valid JWT strings.

import crypto from "crypto";

/**
 * Returns the SHA-256 hex digest of a refresh token string.
 * Always call this before storing or querying a refresh token.
 */
export const hashToken = (token: string): string =>
	crypto.createHash("sha256").update(token).digest("hex");
