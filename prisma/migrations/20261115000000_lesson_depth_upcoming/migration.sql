-- CreateEnum
CREATE TYPE "LessonDepth" AS ENUM ('SHORT', 'FULL');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "depth" "LessonDepth" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "listAsUpcoming" BOOLEAN NOT NULL DEFAULT false;
