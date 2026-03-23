

import { prisma } from "@/lib/db/prisma";

export async function getRecentActivity(
  userId: string
) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
}