import { prisma } from "@/lib/db/prisma";

import { recalculateATS } from "./recalculate-ats";
import { calculateResumeScore } from "./resume-score";
import { analyzeResumeHealth } from "./resume-health";
import { generateSkillGaps } from "./skillgap-generator";
import { generateJobSuggestions } from "./job-suggestions";
import { calculateATS } from "./ats-engine";
import { assertVersionOwner } from "../auth/permissions";
import type { ResumeScoreResult } from "./resume-score";
import { safeAsync } from "./utils/safe";
import { logError } from "./utils/logger";
export async function recalculateAll(resumeVersionId: string, userId: string) {
  await assertVersionOwner(resumeVersionId, userId);

  let version;

  
    // eslint-disable-next-line prefer-const
    version = await safeAsync(
      () =>
        prisma.resumeVersion.findUnique({
          where: { id: resumeVersionId },
          include: {
            job: true,
          },
        }),
      "find version",
    );
  

  if (!version) return;

  const content = version.content;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gaps: any[] = [];

  // ---------------- ATS ----------------
  try {
    await recalculateATS(resumeVersionId);
  } catch (e) {
    console.error("Error recalculating ATS for version", resumeVersionId, e);
  }

  // ---------------- SCORE ----------------

  let score: ResumeScoreResult | null = null;

  try {
    score = await calculateResumeScore(content, version.job?.description);
  } catch (e) {
    console.error(
      "Error calculating resume score for version",
      resumeVersionId,
      e,
    );
  }

  //   if (score) {
  //     try {
  //       await prisma.resumeVersion.update({
  //         where: {
  //           id: resumeVersionId,
  //         },
  //         data: {
  //           scoreSnapshot:
  //             score.profileScore,
  //         },
  //       });
  //     } catch (e) {
  //       console.error(
  //         "Error saving scoreSnapshot",
  //         resumeVersionId,
  //         e
  //       );
  //     }
  //   }

  // ---------------- HEALTH ----------------

  try {
    analyzeResumeHealth(content);
  } catch (e) {
    console.error("Error analyzing resume health", resumeVersionId, e);
  }

  // ---------------- SUGGESTIONS ----------------

  try {
    await generateJobSuggestions(content);
  } catch (e) {
    console.error("Error generating job suggestions", resumeVersionId, e);
  }

  // ---------------- SKILL GAP ----------------

  if (version.job && version.job.description) {
    let ats;

    try {
      ats = calculateATS(content, version.job.description);
    } catch (e) {
      console.error("Error calculating ATS (local)", resumeVersionId, e);
      return;
    }

    try {
      gaps = await generateSkillGaps(version.job.description, {
        matchedSkills: ats.matchedKeywords,
        missingSkills: ats.missingKeywords,
        matchPercentage: ats.score,
      });
    } catch (e) {
      logError("Error generating skill gaps", resumeVersionId, e);
      return;
    }

    // try {
    //   await prisma.skillGap.deleteMany({
    //     where: {
    //       jobId:
    //         version.job.id,
    //     },
    //   });
    // } catch (e) {
    //   console.error(
    //     "Error deleting skill gaps",
    //     version.job.id,
    //     e
    //   );
    // }

    // for (const g of gaps) {
    //   try {
    //     await prisma.skillGap.create({
    //       data: {
    //         jobId:
    //           version.job.id,
    //         skill:
    //           g.skill,
    //         priority:
    //           g.priority,
    //         estimatedTime:
    //           g.estimatedTime,
    //         reasoning:
    //           g.reasoning,
    //         difficulty:
    //           g.difficulty,
    //         learningLink:
    //           g.learningLink,
    //       },
    //     });
    //   } catch (e) {
    //     console.error(
    //       "Error creating skill gap",
    //       g.skill,
    //       e
    //     );
    //   }
    // }
  }

  const job = version.job;
  await prisma.$transaction(async (tx) => {
    // ---------- SCORE ----------

    if (score) {
      await tx.resumeVersion.update({
        where: {
          id: resumeVersionId,
        },
        data: {
          scoreSnapshot: score.profileScore,
        },
      });
    }

    // ---------- SKILL GAP ----------

    if (job && job.description) {
      await tx.skillGap.deleteMany({
        where: {
          jobId: job.id,
        },
      });

      for (const g of gaps) {
        await tx.skillGap.create({
          data: {
            jobId: job.id,
            skill: g.skill,
            priority: g.priority,
            estimatedTime: g.estimatedTime,
            reasoning: g.reasoning,
            difficulty: g.difficulty,
            learningLink: g.learningLink,
          },
        });
      }
    }
  });
}
