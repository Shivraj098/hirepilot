import { prisma } from "@/lib/db/prisma";
import { calculateATS } from "./ats-engine";

export async function recalculateATS(
  resumeVersionId: string
) {

  const version =
    await prisma.resumeVersion.findUnique({
      where: { id: resumeVersionId },
      include: {
        job: true,
      },
    });

  if (!version) return;

  if (!version.jobId) return;

  if (!version.job) return;

  const ats = calculateATS(
    version.content,
    version.job.description
  );

  await prisma.aTSResult.upsert({
    where: {
      resumeVersionId,
    },
    update: {
      score: ats.score,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      weakKeywords: ats.weakKeywords,
    },
    create: {
      resumeVersionId,
      score: ats.score,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      weakKeywords: ats.weakKeywords,
    },
  });
}