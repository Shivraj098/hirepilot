"use server";

import { prisma } from "@/lib/db/prisma";

export async function getScoreTrend(userId: string) {
  const history = await prisma.scoreHistory.findMany({
    where: { userId },
    orderBy: {
      createdAt: "asc",
    },
    take: 20,
  });

  return history.map((h) => ({
    score: h.score,
    atsScore: h.atsScore,
    date: h.createdAt,
  }));
}