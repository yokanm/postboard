// Single module for all password operations.
// argon2 is significantly stronger than bcrypt — it's memory-hard, which makes
// GPU-based brute-force attacks far more expensive.
//
// Migration strategy:
//   1. Replace every `import bcrypt from 'bcrypt'` with `import { hashPassword, verifyPassword } from '@/lib/password'`
//   2. Replace `bcrypt.hash(plain, saltRound)` with `hashPassword(plain)`
//   3. Replace `bcrypt.compare(plain, hash)` with `verifyPassword(plain, hash)`

import argon2 from "argon2";

/**
 * Hash a plain-text password using argon2id.
 * argon2id is the recommended variant — it combines resistance to
 * side-channel attacks (argon2i) and GPU attacks (argon2d).
 */
export const hashPassword = (plain: string): Promise<string> =>
	argon2.hash(plain, {
		type: argon2.argon2id,
		memoryCost: 65536, // 64 MiB — OWASP minimum recommendation
		timeCost: 3, // iterations
		parallelism: 1,
	});

/**
 * Verify a plain-text password against an argon2 hash.
 * Returns true if they match, false otherwise.
 * Never throws on a mismatch — only throws on internal errors.
 */
export const verifyPassword = async (
	plain: string,
	hash: string,
): Promise<boolean> => {
	try {
		return await argon2.verify(hash, plain);
	} catch {
		// argon2.verify throws if the hash is malformed (e.g. bcrypt hash format).
		// During a rolling migration you can add a bcrypt fallback here:
		//   const bcrypt = await import('bcrypt');
		//   return bcrypt.compare(plain, hash);
		return false;
	}
};
