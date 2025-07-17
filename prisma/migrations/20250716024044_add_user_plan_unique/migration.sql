/*
  Warnings:

  - A unique constraint covering the columns `[user_id,plan_id]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_user_id_plan_id_key" ON "UserSubscription"("user_id", "plan_id");
