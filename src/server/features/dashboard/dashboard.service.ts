"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats(userId: string) {
  // resumes

  const resumeCount = await prisma.resume.count({
    where: { userId },
  });

  // jobs

  const jobCount = await prisma.job.count({
    where: { userId },
  });

  // applications

  const applications = await prisma.jobApplication.count({
    where: { userId },

  });

  // interviews (from Application, not Job)

  const interviews = await prisma.jobApplication.count({
    where: {
      userId,
      status: "INTERVIEW",
    },
  });

  // offers

  const offers = await prisma.jobApplication.count({
    where: {
      userId,
      status: "OFFER",
    },
  });

  // rejected

  const rejected = await prisma.jobApplication.count({
    where: {
      userId,
      status: "REJECTED",
    },
  });
  

  // favorite jobs

  const favoriteJobs = await prisma.job.count({
    where: {
      userId,
      isFavorite: true,
    },
  });

  // avg score from ResumeAnalysis

  const scores = await prisma.resumeAnalysis.findMany({
    where: { userId },
    select: {
      score: true,
    },
  });

  let avgScore = 0;

  if (scores.length > 0) {
    const total = scores.reduce((sum, s) => sum + (s.score ?? 0), 0);

    avgScore = Math.round(total / scores.length);
  }

  return {
    resumeCount,
    jobCount,
    applications,
    interviews,
    offers,
    rejected,
    favoriteJobs,
    avgScore,
  };
}
