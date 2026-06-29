-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_companyId_fkey";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
