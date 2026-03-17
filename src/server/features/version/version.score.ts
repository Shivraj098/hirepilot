"use server";

import { prisma } from "@/lib/db/prisma";

export async function getVersionScoreTrend(
  resumeId: string,
  userId: string
) {
  const versions = await prisma.resumeVersion.findMany({
    where: {
      resumeId,
      userId,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  const ids = versions.map((v) => v.id);

  const scores = await prisma.scoreHistory.findMany({
    where: {
      resumeVersionId: {
        in: ids,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return scores;
}