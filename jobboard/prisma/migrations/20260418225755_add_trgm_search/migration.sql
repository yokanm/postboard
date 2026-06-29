CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS jobs_title_trgm
  ON jobs USING gin(title gin_trgm_ops)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS jobs_description_trgm
  ON jobs USING gin(description gin_trgm_ops)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS jobs_status_created_at
  ON jobs (status, "createdAt" DESC)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS jobs_company_status
  ON jobs ("companyId", status, "createdAt" DESC)
  WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS jobs_expiry
  ON jobs ("expiresAt")
  WHERE status = 'OPEN' AND "deletedAt" IS NULL AND "expiresAt" IS NOT NULL;