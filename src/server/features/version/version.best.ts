"use server";

import { prisma } from "@/lib/db/prisma";

export async function getBestVersion(
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
    },
  });

  const ids = versions.map((v) => v.id);

  return prisma.resumeAnalysis.findFirst({
    where: {
      resumeVersionId: {
        in: ids,
      },
    },
    orderBy: {
      score: "desc",
    },
  });
}