import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function saveResumeAnalysis(data: {
  resumeVersionId: string;
  userId: string;
  score?: number;
  atsScore?: number;
  profileScore?: number;
  contentScore?: number;
  skillScore?: number;
  experienceScore?: number;
  strengths?: Prisma.InputJsonValue;
  weaknesses?: Prisma.InputJsonValue;
  recommendedSkills?: Prisma.InputJsonValue;
  summary?: string;
}) {
  return prisma.resumeAnalysis.upsert({
    where: { resumeVersionId: data.resumeVersionId },
    update: {
      score: data.score,
      atsScore: data.atsScore,
      profileScore: data.profileScore,
      contentScore: data.contentScore,
      skillScore: data.skillScore,
      experienceScore: data.experienceScore,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      recommendedSkills: data.recommendedSkills,
      summary: data.summary,
    },
    create: data,
  });
}

export async function saveScoreHistory(data: {
  resumeVersionId: string;
  userId: string;
  score?: number;
  atsScore?: number;
}) {
  return prisma.scoreHistory.create({ data });
}

export async function saveMatchResult(data: {
  resumeVersionId: string;
  jobId: string;
  userId: string;
  matchScore?: number;
  fitLevel?: string;
  shouldApply?: boolean;
  missingSkills?: Prisma.InputJsonValue;
  reason?: string;
}) {
  return prisma.matchResult.upsert({
    where: {
      resumeVersionId_jobId: {
        resumeVersionId: data.resumeVersionId,
        jobId: data.jobId,
      },
    },
    update: {
      matchScore: data.matchScore,
      fitLevel: data.fitLevel,
      shouldApply: data.shouldApply,
      missingSkills: data.missingSkills,
      reason: data.reason,
    },
    create: data,
  });
}

export async function saveJobAnalysis(data: {
  jobId: string;
  userId: string;
  roleCategory?: string;
  requiredLevel?: string;
  difficulty?: string;
  domain?: string;
  importantSkills?: Prisma.InputJsonValue;
  secondarySkills?: Prisma.InputJsonValue;
  score?: number;
  summary?: string;
}) {
  return prisma.jobAnalysis.upsert({
    where: { jobId: data.jobId },
    update: {
      roleCategory: data.roleCategory,
      requiredLevel: data.requiredLevel,
      difficulty: data.difficulty,
      domain: data.domain,
      importantSkills: data.importantSkills,
      secondarySkills: data.secondarySkills,
      score: data.score,
      summary: data.summary,
    },
    create: data,
  });
}