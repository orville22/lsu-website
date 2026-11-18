-- Expert reviewer track: experts answer a longer set of feedback questions.
ALTER TABLE "Reviewer" ADD COLUMN "track" TEXT NOT NULL DEFAULT 'learner';

ALTER TABLE "Feedback" ADD COLUMN "track" TEXT NOT NULL DEFAULT 'learner',
ADD COLUMN "currency" TEXT NOT NULL DEFAULT '',
ADD COLUMN "references" TEXT NOT NULL DEFAULT '';
