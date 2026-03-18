"use server";

import { prisma } from "@/lib/db/prisma";

export async function getBestData(
  userId: string
) {
  const bestResume =
    await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: {
        score: "desc",
      },
    });

  const bestMatch =
    await prisma.matchResult.findFirst({
      where: { userId },
      orderBy: {
        matchScore: "desc",
      },
    });

  return {
    bestResume,
    bestMatch,
  };
}