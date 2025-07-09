-- AlterTable
ALTER TABLE "User" ALTER COLUMN "last_login" SET DATA TYPE TIMESTAMP(6);

-- CreateIndex
CREATE INDEX "User_is_active_idx" ON "User"("is_active");

-- CreateIndex
CREATE INDEX "User_last_login_idx" ON "User"("last_login");

-- CreateIndex
CREATE INDEX "User_is_subscription_active_idx" ON "User"("is_subscription_active");
