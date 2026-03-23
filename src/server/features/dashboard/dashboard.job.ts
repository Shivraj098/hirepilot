

import { prisma } from "@/lib/db/prisma";

export async function getBestJobMatches(userId: string) {
  return prisma.matchResult.findMany({
    where: { userId },
    orderBy: {
      matchScore: "desc",
    },
    take: 5,
    include: {
      job: true,
    },
  });
}