-- Add company ownership without changing the UserRole enum.
ALTER TABLE "companies"
ADD COLUMN "primaryAdminId" TEXT;

CREATE UNIQUE INDEX "companies_primaryAdminId_key"
ON "companies"("primaryAdminId");

CREATE INDEX "companies_primaryAdminId_idx"
ON "companies"("primaryAdminId");

ALTER TABLE "companies"
ADD CONSTRAINT "companies_primaryAdminId_fkey"
FOREIGN KEY ("primaryAdminId")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
