-- CreateEnum
CREATE TYPE "ReviewerStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DECLINED', 'REVOKED');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "consentText" TEXT NOT NULL DEFAULT '',
    "creditConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewerStatus" NOT NULL DEFAULT 'REQUESTED',
    "accessTokenHash" TEXT,
    "invitedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reviewerId" TEXT,
    "path" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL DEFAULT '',
    "clarity" INTEGER,
    "level" TEXT,
    "accuracy" TEXT NOT NULL DEFAULT '',
    "illustrations" TEXT NOT NULL DEFAULT '',
    "missing" TEXT NOT NULL DEFAULT '',
    "comment" TEXT NOT NULL DEFAULT '',
    "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_email_key" ON "Reviewer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_accessTokenHash_key" ON "Reviewer"("accessTokenHash");

-- CreateIndex
CREATE INDEX "Reviewer_status_updatedAt_idx" ON "Reviewer"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_path_idx" ON "Feedback"("path");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
