"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats(userId: string) {
  const [resumeCount, jobCount, applicationCount, versionCount, avgScore] =
    await Promise.all([
      prisma.resume.count({
        where: {
          userId,
        },
      }),

      prisma.job.count({
        where: {
          userId,
        },
      }),

      prisma.jobApplication.count({
        where: {
          userId,
        },
      }),

      prisma.resumeVersion.count({
        where: {
          userId,
        },
      }),

      prisma.scoreHistory.aggregate({
        where: {
          userId,
        },
        _avg: {
          score: true,
        },
      }),
    ]);

  return {
    resumeCount,

    jobCount,

    applicationCount,

    versionCount,

    avgScore: avgScore._avg.score ?? 0,
  };
}
