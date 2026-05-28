"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

import { assertResumeOwner } from "@/server/auth/permissions";

import { calculateATSAsync } from "@/server/ai/resume/ats-engine";
import { analyzeResumeProfile } from "@/server/ai/resume/resume-intelligence";
import { calculateResumeScore } from "@/server/ai/resume/resume-score";

import { getLatestVersion } from "@/server/features/version/version.service";
import { logActivity } from "@/server/features/activity/activity.service";

import { logError } from "@/server/utils/logger";

// ======================================================
// TYPES
// ======================================================

type ImprovementImpact = "HIGH" | "MEDIUM" | "LOW";

interface ATSAnalysisDTO {
  score: number;

  matchedKeywords: string[];

  missingKeywords: string[];

  weakKeywords: string[];
}

interface ResumeScoringDTO {
  profileScore: number;

  atsScore: number;

  contentScore: number;

  clarityScore: number;

  experienceScore: number;

  skillsScore: number;
}

interface ResumeIntelligenceDTO {
  strengths: string[];

  weaknesses: string[];

  improvements: ResumeImprovement[];

  summary: string;
}

type ImprovementCategory =
  | "ATS"
  | "Keywords"
  | "Impact"
  | "Formatting"
  | "Skills"
  | "Content";

export interface ResumeImprovement {
  category: ImprovementCategory;
  issue: string;
  fix: string;
  impact: ImprovementImpact;
}

export interface ResumeAnalysisResult {
  success: boolean;

  scoring: ResumeScoringDTO;

  ats: ATSAnalysisDTO;

  intelligence: ResumeIntelligenceDTO;

  analysisEngineVersion: string;
}

// ======================================================
// CONSTANTS
// ======================================================

const ANALYSIS_ENGINE_VERSION = "resume-analysis-v3";

// ======================================================
// HELPERS
// ======================================================

function normalizeScore(score: unknown): number {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
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

// ======================================================
// AI RECOMMENDATION LAYER
// ======================================================

// ======================================================
// MAIN ANALYSIS ACTION
// ======================================================

export async function runResumeAnalysis(
  resumeId: string,
): Promise<ResumeAnalysisResult> {
  // ======================================================
  // AUTH
  // ======================================================

  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  // ======================================================
  // OWNERSHIP
  // ======================================================

  await assertResumeOwner(resumeId, user.id);

  // ======================================================
  // GET BASE VERSION
  // ======================================================

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("No base resume version found");
  }

  // ======================================================
  // PREVENT EMPTY CONTENT ANALYSIS
  // ======================================================

  if (!baseVersion.content) {
    throw new Error("Resume content is empty");
  }

  // ======================================================
  // ATS ANALYSIS
  // IMPORTANT:
  // General ATS analysis should NOT pass empty string
  // because original ATS engine returns zero scores.
  // ======================================================

  const atsResult = await calculateATSAsync(
    baseVersion.content,
    "General software engineering resume evaluation",
  );

  // ======================================================
  // PARALLEL ANALYSIS
  // ======================================================

  const [scoreResult, intelligenceResult] = await Promise.allSettled([
    calculateResumeScore(baseVersion.content, undefined),

    analyzeResumeProfile(baseVersion.content, user.id),
  ]);

  // ======================================================
  // SCORE VALIDATION
  // ======================================================

  if (scoreResult.status !== "fulfilled" || !scoreResult.value) {
    logError(
      "Resume scoring failed",
      scoreResult.status === "rejected"
        ? scoreResult.reason
        : "No score returned",
    );

    throw new Error("Resume scoring failed. Please try again.");
  }

  const scoring = scoreResult.value;

  const intelligence =
    intelligenceResult.status === "fulfilled" ? intelligenceResult.value : null;

  // ======================================================
  // UNIFIED SCORE NORMALIZATION
  // ======================================================

  const profileScore = normalizeScore(scoring.profileScore);

  const atsScore = normalizeScore(scoring.atsScore);

  const contentScore = normalizeScore(scoring.contentScore);

  const clarityScore = normalizeScore(intelligence?.clarityScore);

  const experienceScore = normalizeScore(scoring.experienceScore);

  const skillsScore = normalizeScore(scoring.skillScore);

  // ======================================================
  // AI RECOMMENDATIONS
  // ======================================================

  // ======================================================
  // BUILD FINAL NORMALIZED DTO
  // ======================================================

  const analysisResult: ResumeAnalysisResult = {
  success: true,

  scoring: {
    profileScore,
    atsScore,
    contentScore,
    clarityScore,
    experienceScore,
    skillsScore,
  },

  ats: {
    score: atsScore,

    matchedKeywords:
      safeArray(atsResult.matchedKeywords),

    missingKeywords:
      safeArray(atsResult.missingKeywords),

    weakKeywords:
      safeArray(atsResult.weakKeywords),
  },

  intelligence: {
    strengths:
      safeArray(intelligence?.strengths),

    weaknesses:
      safeArray(intelligence?.weaknesses),

    improvements:
      safeArray(
        intelligence?.improvementTips
      ).map((tip) => ({
        category: "Content",
        issue: tip,
        fix: tip,
        impact: "MEDIUM",
      })),

    summary:
      intelligence?.summaryFeedback ?? "",
  },

  analysisEngineVersion:
    ANALYSIS_ENGINE_VERSION,
};

  // ======================================================
  // DATABASE TRANSACTION
  // ======================================================

  await prisma.$transaction(async (tx) => {
    // ====================================================
    // ATS RESULT
    // ====================================================

    await tx.aTSResult.upsert({
      where: {
        resumeVersionId: baseVersion.id,
      },

      update: {
        score: analysisResult.scoring.atsScore,

        matchedKeywords: analysisResult.matchedKeywords,

        missingKeywords: analysisResult.missingKeywords,

        weakKeywords: analysisResult.weakKeywords,
      },

      create: {
        resumeVersionId: baseVersion.id,

        score: analysisResult.atsScore,

        matchedKeywords: analysisResult.matchedKeywords,

        missingKeywords: analysisResult.missingKeywords,

        weakKeywords: analysisResult.weakKeywords,
      },
    });

    // ====================================================
    // RESUME ANALYSIS
    // ====================================================

    await tx.resumeAnalysis.upsert({
      where: {
        resumeVersionId: baseVersion.id,
      },

      update: {
        score: analysisResult.profileScore,

        profileScore: analysisResult.profileScore,

        atsScore: analysisResult.atsScore,

        contentScore: analysisResult.contentScore,

        skillScore: analysisResult.skillsScore,

        experienceScore: analysisResult.experienceScore,

        strengths: analysisResult.strengths as Prisma.InputJsonValue,

        weaknesses: analysisResult.weaknesses as Prisma.InputJsonValue,

        recommendedSkills:
          analysisResult.missingKeywords as Prisma.InputJsonValue,

        summary: analysisResult.summary,
      },

      create: {
        resumeVersionId: baseVersion.id,

        userId: user.id,

        score: analysisResult.profileScore,

        profileScore: analysisResult.profileScore,

        atsScore: analysisResult.atsScore,

        contentScore: analysisResult.contentScore,

        skillScore: analysisResult.skillsScore,

        experienceScore: analysisResult.experienceScore,

        strengths: analysisResult.strengths as Prisma.InputJsonValue,

        weaknesses: analysisResult.weaknesses as Prisma.InputJsonValue,

        recommendedSkills:
          analysisResult.missingKeywords as Prisma.InputJsonValue,

        summary: analysisResult.summary,
      },
    });

    // ====================================================
    // SCORE HISTORY
    // ====================================================

    await tx.scoreHistory.create({
      data: {
        resumeVersionId: baseVersion.id,

        userId: user.id,

        score: analysisResult.profileScore,

        atsScore: analysisResult.atsScore,
      },
    });

    // ====================================================
    // SNAPSHOT UPDATE
    // ====================================================

    await tx.resumeVersion.update({
      where: {
        id: baseVersion.id,
      },

      data: {
        scoreSnapshot: analysisResult.profileScore,
      },
    });
  });

  // ======================================================
  // ACTIVITY LOG
  // ======================================================

  logActivity({
    userId: user.id,

    type: "RESUME_INTELLIGENCE",

    message: "Resume analyzed successfully",
  });

  // ======================================================
  // CACHE REVALIDATION
  // ======================================================

  revalidatePath(`/dashboard/resumes/${resumeId}`);

  // ======================================================
  // RETURN FRONTEND-READY DTO
  // ======================================================

  return analysisResult;
}

// ======================================================
// JOB MATCH ANALYSIS
// ======================================================

export async function runJobMatchAnalysis(resumeId: string, jobId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  await assertResumeOwner(resumeId, user.id);

  const [baseVersion, job] = await Promise.all([
    getLatestVersion(resumeId, user.id),

    prisma.job.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
    }),
  ]);

  if (!baseVersion) {
    throw new Error("No base version found");
  }

  if (!job) {
    throw new Error("Job not found");
  }

  // ======================================================
  // TRUE JOB-MATCH ATS
  // ======================================================

  const atsResult = await calculateATSAsync(
    baseVersion.content,
    job.description,
  );

  await prisma.aTSResult.upsert({
    where: {
      resumeVersionId: baseVersion.id,
    },

    update: {
      score: atsResult.score,

      matchedKeywords: atsResult.matchedKeywords,

      missingKeywords: atsResult.missingKeywords,

      weakKeywords: atsResult.weakKeywords,
    },

    create: {
      resumeVersionId: baseVersion.id,

      score: atsResult.score,

      matchedKeywords: atsResult.matchedKeywords,

      missingKeywords: atsResult.missingKeywords,

      weakKeywords: atsResult.weakKeywords,
    },
  });

  revalidatePath(`/dashboard/resumes/${resumeId}`);

  revalidatePath(`/dashboard/jobs/${jobId}`);

  return atsResult;
}
