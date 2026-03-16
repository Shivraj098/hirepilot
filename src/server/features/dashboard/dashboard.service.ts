"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats(userId: string) {
  const resumeCount = await prisma.resume.count({
    where: { userId },
  });

  const jobCount = await prisma.job.count({
    where: { userId },
  });

  const applications = await prisma.jobApplication.count({
    where: { userId },
  });

  const interviews = await prisma.jobApplication.count({
    where: {
      userId,
      interviewAt: { not: null },
    },
  });

  const favoriteJobs = await prisma.job.count({
    where: {
      userId,
      isFavorite: true,
    },
  });

  // ✅ NEW — avg score from analysis

  const scores = await prisma.resumeAnalysis.findMany({
    where: { userId },
    select: {
      score: true,
    },
  });

  let avgScore = 0;

  if (scores.length > 0) {
    const total = scores.reduce(
      (sum, s) => sum + (s.score ?? 0),
      0
    );

    avgScore = Math.round(total / scores.length);
  }

  return {
    resumeCount,
    jobCount,
    applications,
    interviews,
    favoriteJobs,
    avgScore,
  };
}