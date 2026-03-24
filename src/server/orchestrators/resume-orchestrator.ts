import { prisma } from "@/lib/db/prisma";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { calculateResumeScore } from "@/server/ai/resume/resume-score";
import { generateSkillGaps } from "@/server/ai/skills/skillgap-generator";
import { analyzeResumeHealth } from "@/server/ai/resume/resume-health";
import { calculateSkillGap } from "@/server/ai/skills/skill-gap";
import { logError } from "@/server/utils/logger";
import { Priority, Difficulty } from "@prisma/client";

export async function recalculateResumePipeline(
  resumeVersionId: string,
  userId: string
) {
  const version = await prisma.resumeVersion.findUnique({
    where: { id: resumeVersionId },
    include: { job: true },
  });

  if (!version) return;

  const content = version.content;
  const job = version.job;

  // ==============================
  // STEP 1 — ATS (computed once, reused)
  // ==============================

  let atsData: ReturnType<typeof calculateATS> | null = null;

  try {
    atsData = calculateATS(content, job?.description ?? "");

    await prisma.aTSResult.upsert({
      where: { resumeVersionId },
      update: {
        score: atsData.score,
        matchedKeywords: atsData.matchedKeywords,
        missingKeywords: atsData.missingKeywords,
        weakKeywords: atsData.weakKeywords,
      },
      create: {
        resumeVersionId,
        score: atsData.score,
        matchedKeywords: atsData.matchedKeywords,
        missingKeywords: atsData.missingKeywords,
        weakKeywords: atsData.weakKeywords,
      },
    });
  } catch (e) {
    logError("ATS pipeline step failed", e);
  }

  // ==============================
  // STEP 2 — SCORE + HEALTH (parallel)
  // ==============================

  await Promise.allSettled([
    // Score
    calculateResumeScore(content, job?.description, userId)
      .then(async (score) => {
        if (!score) return;

        await prisma.resumeVersion.update({
          where: { id: resumeVersionId },
          data: { scoreSnapshot: score.profileScore ?? 0 },
        });

        await prisma.scoreHistory.create({
          data: {
            resumeVersionId,
            userId,
            score: score.profileScore,
            atsScore: score.atsScore,
          },
        });
      })
      .catch((e) => logError("Score pipeline step failed", e)),

    // Health check — result stored on version notes for now
    Promise.resolve()
      .then(() => analyzeResumeHealth(content))
      .catch((e) => logError("Health pipeline step failed", e)),
  ]);

  // ==============================
  // STEP 3 — SKILL GAP (only if job linked)
  // ==============================

  if (!job?.description || !job.id) return;

  try {
    // Reuse atsData computed in Step 1
    const skillGap = atsData
      ? {
          matchedSkills: atsData.matchedKeywords,
          missingSkills: atsData.missingKeywords,
          matchPercentage: atsData.score,
          jobFrequencyMap: {} as Record<string, number>,
        }
      : calculateSkillGap(content, job.description);

    const gaps = await generateSkillGaps(job.description, skillGap);

    if (gaps.length > 0) {
      await prisma.$transaction([
        prisma.skillGap.deleteMany({ where: { jobId: job.id } }),
        prisma.skillGap.createMany({
          data: gaps.map((g) => ({
            jobId: job.id,
            skill: g.skill,
            priority: (g.priority as Priority) ?? Priority.MEDIUM,
            estimatedTime: g.estimatedTime,
            reasoning: g.reasoning,
            difficulty: (g.difficulty as Difficulty) ?? Difficulty.MEDIUM,
            learningLink: g.learningLink ?? null,
          })),
        }),
      ]);
    }
  } catch (e) {
    logError("Skill gap pipeline step failed", e);
  }
}