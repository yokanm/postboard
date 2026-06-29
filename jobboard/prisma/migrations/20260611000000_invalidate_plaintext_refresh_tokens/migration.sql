-- Migration: 20260611000000_invalidate_plaintext_refresh_tokens
--
-- PURPOSE:
--   Refresh tokens are now stored as SHA-256 hashes instead of plaintext.
--   Any token rows written before this migration contain raw JWT strings,
--   which cannot be looked up after the application code is deployed.
--   Truncating both tables forces all active sessions to re-authenticate —
--   a deliberate, one-time disruption that closes the plaintext-storage
--   security gap immediately.
--
-- SCOPE:
--   • refresh_token                 — user and company sessions
--   • super_admin_refresh_tokens    — super admin sessions
--
-- NO SCHEMA CHANGES:
--   The `token` column remains VARCHAR / TEXT with a UNIQUE constraint.
--   The only change is what value is stored (hash vs plaintext), which
--   requires no DDL alteration — only the data must be cleared.

-- Revoke all user / company refresh tokens.
-- Sessions will expire; users must log in again.
DELETE FROM refresh_token;

-- Revoke all super admin refresh tokens.
DELETE FROM super_admin_refresh_tokens;
