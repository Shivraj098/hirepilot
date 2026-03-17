"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardInsights(userId: string) {
  // best score

  const bestScore = await prisma.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: {
      score: "desc",
    },
  });

  // best match

  const bestMatch = await prisma.matchResult.findFirst({
    where: { userId },
    orderBy: {
      matchScore: "desc",
    },
  });

  // latest activity

  const lastActivity = await prisma.activity.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  // latest analysis

  const latestAnalysis = await prisma.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    bestScore,
    bestMatch,
    lastActivity,
    latestAnalysis,
  };
}