import { prisma } from "@/lib/db/prisma";
import { calculateATSAsync } from "@/server/ai/resume/ats-engine";
import { calculateResumeScore } from "@/server/ai/resume/resume-score";
import { generateSkillGaps } from "@/server/ai/skills/skillgap-generator";
import { calculateSkillGap } from "@/server/ai/skills/skill-gap";
import { logError } from "@/server/utils/logger";
import { Priority, Difficulty, Prisma } from "@prisma/client";
import { analyzeResumeProfile } from "../ai/resume/resume-intelligence";
import { Recommendation, ResumeAnalysisResult } from "../types/analysis.types";
import {
  saveResumeAnalysis,
  saveScoreHistory,
} from "../features/analysis/analysis.service";
import { updateResumeScoreSnapshot } from "../features/version/version.service";

const ANALYSIS_ENGINE_VERSION = "resume-analysis-v3";
export async function runResumeAnalysisPipeline(params: {
  resumeId: string;

  resumeVersionId: string;

  userId: string;

  content: unknown;

  jobDescription?: string;
}): Promise<ResumeAnalysisResult> {
  const atsResult = await calculateATSAsync(
    params.content,
    params.jobDescription ?? "",
  );

  // ======================================================
  // ATS ANALYSIS
  // IMPORTANT:
  // General ATS analysis should NOT pass empty string
  // because original ATS engine returns zero scores.
  // ======================================================

  // ======================================================
  // PARALLEL ANALYSIS
  // ======================================================
  const scoring = await calculateResumeScore(
    params.content,
    params.jobDescription,
  );

  if (!scoring) {
    throw new Error("Resume scoring failed.");
  }

  const intelligence = await analyzeResumeProfile(
    params.content,
    scoring,
    atsResult,
    params.userId,
  );

  const profileScore = normalizeScore(scoring.profileScore);

  const atsScore = normalizeScore(scoring.atsScore);

  const contentScore = normalizeScore(scoring.contentScore);

  const clarityScore = contentScore;
  const experienceScore = normalizeScore(scoring.experienceScore);

  const skillsScore = normalizeScore(scoring.skillScore);
  const recommendationSource = Array.from(
    new Set([
      ...safeArray(scoring.tips),
      ...safeArray(intelligence?.missingSkills).map(
        (skill) => `Consider strengthening ${skill}.`,
      ),
    ]),
  );
  const analysisResult: ResumeAnalysisResult = {
    success: true,

    scores: {
      profile: profileScore,
      ats: atsScore,
      content: contentScore,
      clarity: clarityScore,
      experience: experienceScore,
      skills: skillsScore,
    },

    keywords: {
      score: atsResult.score,
      matched: safeArray(atsResult.matchedKeywords),

      missing: safeArray(atsResult.missingKeywords),

      weak: safeArray(atsResult.weakKeywords),
    },

    insights: {
      strengths: safeArray(intelligence?.strengths),

      weaknesses: safeArray(intelligence?.weaknesses),

      recommendations: buildRecommendations(recommendationSource),

      summary: intelligence?.summaryFeedback ?? "",
    },

    analysisEngineVersion: ANALYSIS_ENGINE_VERSION,
  };

  await prisma.$transaction(async (tx) => {
    // ====================================================
    // ATS RESULT
    // ====================================================

    await tx.aTSResult.upsert({
      where: {
        resumeVersionId: params.resumeVersionId,
      },

      update: {
        score: analysisResult.keywords.score,

        matchedKeywords: analysisResult.keywords.matched,

        missingKeywords: analysisResult.keywords.missing,

        weakKeywords: analysisResult.keywords.weak,
      },

      create: {
        resumeVersionId: params.resumeVersionId,

        score: analysisResult.keywords.score,

        matchedKeywords: analysisResult.keywords.matched,

        missingKeywords: analysisResult.keywords.missing,

        weakKeywords: analysisResult.keywords.weak,
      },
    });

    // ====================================================
    // RESUME ANALYSIS
    // ====================================================

    await saveResumeAnalysis(tx, {
      resumeVersionId: params.resumeVersionId,

      userId: params.userId,

      score: analysisResult.scores.profile,

      profileScore: analysisResult.scores.profile,

      atsScore: analysisResult.scores.ats,

      contentScore: analysisResult.scores.content,

      skillScore: analysisResult.scores.skills,

      experienceScore: analysisResult.scores.experience,

      strengths: analysisResult.insights.strengths as Prisma.InputJsonValue,

      weaknesses: analysisResult.insights.weaknesses as Prisma.InputJsonValue,

      recommendedSkills: analysisResult.keywords
        .missing as Prisma.InputJsonValue,

      summary: analysisResult.insights.summary,
    });

    // ====================================================
    // SCORE HISTORY
    // ====================================================

    await saveScoreHistory(tx, {
      resumeVersionId: params.resumeVersionId,

      userId: params.userId,

      score: analysisResult.scores.profile,

      atsScore: analysisResult.scores.ats,
    });

    // ====================================================
    // SNAPSHOT UPDATE
    // ====================================================
    await updateResumeScoreSnapshot(
      tx,
      params.resumeVersionId,
      analysisResult.scores.profile,
    );
  });

  return analysisResult;
}
function normalizeScore(score: unknown): number {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
function buildRecommendations(tips: string[]): Recommendation[] {
  return tips.map((tip) => {
    const text = tip.toLowerCase();

    if (text.includes("ats") || text.includes("keyword")) {
      return {
        category: "ATS",
        issue: tip,
        fix: tip,
        impact: "HIGH",
      };
    }

    if (
      text.includes("skill") ||
      text.includes("technology") ||
      text.includes("framework") ||
      text.includes("stack") ||
      text.includes("tool")
    ) {
      return {
        category: "Skills",
        issue: tip,
        fix: tip,
        impact: "HIGH",
      };
    }

    if (
      text.includes("metric") ||
      text.includes("achievement") ||
      text.includes("impact") ||
      text.includes("quantified") ||
      text.includes("%") ||
      text.includes("increase") ||
      text.includes("reduced")
    ) {
      return {
        category: "Impact",
        issue: tip,
        fix: tip,
        impact: "HIGH",
      };
    }

    if (text.includes("summary")) {
      return {
        category: "Content",
        issue: tip,
        fix: tip,
        impact: "MEDIUM",
      };
    }

    return {
      category: "Content",
      issue: tip,
      fix: tip,
      impact: "MEDIUM",
    };
  });
}
function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}
export async function recalculateResumePipeline(
  resumeVersionId: string,
  userId: string,
) {
  const version = await prisma.resumeVersion.findUnique({
    where: { id: resumeVersionId },
    include: { job: true },
  });

  if (!version) return;

  await runResumeAnalysisPipeline({
    resumeId: version.resumeId,
    resumeVersionId,
    userId,
    content: version.content,
    jobDescription: version.job?.description,
  });

  const job = version.job;

  if (!job?.description || !job.id) return;

  try {
    const skillGap = calculateSkillGap(version.content, job.description);

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
