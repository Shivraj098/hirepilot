

import { prisma } from "@/lib/db/prisma";

export async function getPipelineStats(
  userId: string
) {

  const jobs =
    await prisma.job.groupBy({

      by: ["status"],

      where: {
        userId,
      },

      _count: {
        status: true,
      },

    });

  const result = {
    SAVED: 0,
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  for (const j of jobs) {
    result[j.status] =
      j._count.status;
  }

  return result;

}