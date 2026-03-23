

import { prisma } from "@/lib/db/prisma";

export async function getInsights(
  userId: string
) {
  const latestAnalysis =
    await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

  const latestJob =
    await prisma.jobAnalysis.findFirst({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    latestAnalysis,
    latestJob,
  };
}