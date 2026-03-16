"use server";

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
}) {
  return prisma.resumeAnalysis.create({
    data,
  });
}

export async function saveScoreHistory(data: {
  resumeVersionId: string;
  userId: string;
  score?: number;
  atsScore?: number;
}) {
  return prisma.scoreHistory.create({
    data,
  });
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
  return prisma.matchResult.create({
    data,
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
}) {
  return prisma.jobAnalysis.create({
    data,
  });
}
