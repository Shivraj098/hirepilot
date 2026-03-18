import { prisma } from "@/lib/db/prisma";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { calculateResumeScore } from "@/server/ai/resume/resume-score";
import { generateSkillGaps } from "@/server/ai/skills/skillgap-generator";
import { generateJobSuggestions } from "@/server/ai/job/job-suggestions";
import { analyzeResumeHealth } from "@/server/ai/resume/resume-health";

import { logError } from "@/server/utils/logger";

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

  // ATS
  try {
    const ats = calculateATS(content, version.job?.description || "");

    await prisma.aTSResult.upsert({
      where: { resumeVersionId },
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
  } catch (e) {
    logError("ATS failed", e);
  }

  // Score
  try {
    const score = await calculateResumeScore(
      content,
      version.job?.description
    );

    if (score) {
      await prisma.resumeVersion.update({
        where: { id: resumeVersionId },
        data: { 
          scoreSnapshot: score.profileScore ?? 0,
         },
      });

      await prisma.scoreHistory.create({
        data: {
          resumeVersionId,
          userId,
          score: score.profileScore,
          atsScore: score.atsScore,
        },
      });
    }
  } catch (e) {
    logError("Score failed", e);
  }

  // Health
  try {
    analyzeResumeHealth(content);
  } catch (e) {
    logError("Health failed", e);
  }

  // Suggestions
  // Job Suggestions
try {

  const suggestions =
    await generateJobSuggestions(
      content
    );

  if (
    suggestions &&
    suggestions.length > 0
  ) {
    await prisma.jobAnalysis.createMany({
      data: suggestions.map(
        (s) => ({
          userId,

          roleCategory:
            s.roleCategory ?? null,

          domain:
            s.domain ?? null,

          summary:
            s.summary ?? null,
        })
      ),
    });
  }

} catch (e) {

  logError(
    "Suggestions failed",
    e
  );

}

  // Skill Gap
  try {
    if (version.job?.description) {
      const ats = calculateATS(content, version.job.description);

      const gaps = await generateSkillGaps(version.job.description, {
        matchedSkills: ats.matchedKeywords,
        missingSkills: ats.missingKeywords,
        matchPercentage: ats.score,
      });

      await prisma.skillGap.deleteMany({
        where: { jobId: version.job.id },
      });

      await prisma.skillGap.createMany({
        data: gaps.map((g) => ({
          jobId: version.job.id ,
          skill: g.skill,
          priority: g.priority,
          estimatedTime: g.estimatedTime,
          reasoning: g.reasoning,
          difficulty: g.difficulty,
          learningLink: g.learningLink,
        })),
      });
    }
  } catch (e) {
    logError("Skill gap failed", e);
  }
}