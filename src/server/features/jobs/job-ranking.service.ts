"use server";

import { prisma } from "@/lib/db/prisma";

export async function rankJobsForUser(userId: string) {
  const jobs = await prisma.job.findMany({
    where: { userId },
    include: {
      applications: true,
      skillGaps: true,
    },
  });

  return jobs.map((job) => {
    const application = job.applications[0];

    const statusScore =
      application?.status === "APPLIED"
        ? 80
        : application?.status === "INTERVIEW"
        ? 90
        : 50;

    const gapPenalty = job.skillGaps.length * 5;

    const score = statusScore - gapPenalty;

    return {
      job,
      rankScore: score,
    };
  }).sort((a, b) => b.rankScore - a.rankScore);
}