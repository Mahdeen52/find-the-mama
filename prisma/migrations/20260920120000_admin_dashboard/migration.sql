CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "statusReason" TEXT,
ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isTrustedContributor" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;

ALTER TABLE "Vendor" ALTER COLUMN "verificationLevel" DROP DEFAULT;
ALTER TABLE "Vendor" ALTER COLUMN "verificationLevel" TYPE INTEGER USING CASE
  WHEN "verificationLevel" IN ('official', 'moderator') THEN 2
  WHEN "verificationLevel" = 'claimed' THEN 3
  WHEN "verificationLevel" = 'community' THEN 1
  ELSE 0 END;
ALTER TABLE "Vendor" ALTER COLUMN "verificationLevel" SET DEFAULT 0;
ALTER TABLE "Vendor" ADD COLUMN "verificationNotes" TEXT,
ADD COLUMN "claimedByUserId" TEXT,
ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "weightedRatingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "trustedReviewCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Review" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "moderationReason" TEXT;
ALTER TABLE "Photo" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isInappropriate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "moderationReason" TEXT;

ALTER TABLE "Report" ALTER COLUMN "vendorId" DROP NOT NULL;
ALTER TABLE "Report" ADD COLUMN "reviewId" TEXT,
ADD COLUMN "photoId" TEXT,
ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'VENDOR',
ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "assignedToId" TEXT,
ADD COLUMN "resolutionType" TEXT,
ADD COLUMN "internalNote" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "ActivityLog" ADD COLUMN "reason" TEXT, ADD COLUMN "metadata" JSONB;

CREATE TABLE "AdminSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "trustScoreThresholdForTrusted" INTEGER NOT NULL DEFAULT 50,
  "pointsReviewWithPhoto" INTEGER NOT NULL DEFAULT 10,
  "pointsReviewWithoutPhoto" INTEGER NOT NULL DEFAULT 5,
  "pointsVendorLevel1" INTEGER NOT NULL DEFAULT 20,
  "penaltySpam" INTEGER NOT NULL DEFAULT -20,
  "penaltyFakeVendor" INTEGER NOT NULL DEFAULT -30,
  "trustedReviewWeight" DOUBLE PRECISION NOT NULL DEFAULT 2,
  "regularReviewWeight" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "autoLevel1MinTrustedPhotoReviews" INTEGER NOT NULL DEFAULT 3,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Vendor_verificationLevel_idx" ON "Vendor"("verificationLevel");
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");
CREATE INDEX "Vendor_area_idx" ON "Vendor"("area");
CREATE INDEX "Vendor_zone_idx" ON "Vendor"("zone");
CREATE INDEX "Review_isHidden_isSpam_idx" ON "Review"("isHidden", "isSpam");
CREATE INDEX "Photo_isHidden_isInappropriate_idx" ON "Photo"("isHidden", "isInappropriate");
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
