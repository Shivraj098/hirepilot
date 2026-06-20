"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

import { assertResumeOwner } from "@/server/auth/permissions";

import { calculateATSAsync } from "@/server/ai/resume/ats-engine";

import { getLatestVersion } from "@/server/features/version/version.service";
import { logActivity } from "@/server/features/activity/activity.service";
import { runResumeAnalysisPipeline } from "../orchestrators/resume-orchestrator";
import { ResumeAnalysisResult } from "../types/analysis.types";

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
  const analysisResult = await runResumeAnalysisPipeline({
    resumeId,

    resumeVersionId: baseVersion.id,

    userId: user.id,

    content: baseVersion.content,
  });

  // ======================================================
  // UNIFIED SCORE NORMALIZATION
  // ======================================================

  // ======================================================
  // AI RECOMMENDATIONS
  // ======================================================

  // ======================================================
  // BUILD FINAL NORMALIZED DTO
  // ======================================================

  // ======================================================
  // DATABASE TRANSACTION
  // ======================================================

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
  return analysisResult; // ======================================================
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
