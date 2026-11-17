-- CreateEnum
CREATE TYPE "ReviewerStatus" AS ENUM ('REQUESTED', 'INVITED', 'ACTIVE', 'REVOKED', 'DECLINED');

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'admin',
    "status" "ReviewerStatus" NOT NULL DEFAULT 'REQUESTED',
    "tokenHash" TEXT,
    "invitedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT,
    "actor" TEXT,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'page',
    "rating" INTEGER,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "comment" TEXT NOT NULL DEFAULT '',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_email_key" ON "Reviewer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_tokenHash_key" ON "Reviewer"("tokenHash");

-- CreateIndex
CREATE INDEX "Reviewer_status_createdAt_idx" ON "Reviewer"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_path_idx" ON "Feedback"("path");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
