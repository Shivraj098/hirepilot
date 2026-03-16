"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardInsights(userId: string) {
  const bestScore = await prisma.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: {
      score: "desc",
    },
  });

  const bestMatch = await prisma.matchResult.findFirst({
    where: { userId },
    orderBy: {
      matchScore: "desc",
    },
  });

  const lastActivity = await prisma.activity.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    bestScore,
    bestMatch,
    lastActivity,
  };
}