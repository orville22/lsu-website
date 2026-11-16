-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT '',
    "consentText" TEXT NOT NULL DEFAULT '',
    "confirmTokenHash" TEXT,
    "confirmExpiresAt" TIMESTAMP(3),
    "confirmSentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_confirmTokenHash_key" ON "Subscriber"("confirmTokenHash");

-- CreateIndex
CREATE INDEX "Subscriber_status_updatedAt_idx" ON "Subscriber"("status", "updatedAt");
