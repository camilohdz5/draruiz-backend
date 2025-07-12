-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expires" TIMESTAMP(3);
