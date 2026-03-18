"use server";

import { prisma } from "@/lib/db/prisma";

export async function getScoreTrend(
  userId: string
) {

  const scores =
    await prisma.scoreHistory.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        score: true,
        atsScore: true,
        createdAt: true,
      },
    });

  return scores;

}