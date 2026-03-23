import { prisma } from "@/lib/db/prisma";

export async function getScoreTrend(userId: string) {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  return prisma.scoreHistory.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      score: true,
      atsScore: true,
      createdAt: true,
    },
    take: 30,
  });
}