-- AlterTable
ALTER TABLE "JobAnalysis" ADD COLUMN     "score" INTEGER,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "AICache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AICache_key_key" ON "AICache"("key");
