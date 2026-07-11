-- AlterTable
ALTER TABLE "RiotAccount" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verifiedAt" TIMESTAMP(3);
