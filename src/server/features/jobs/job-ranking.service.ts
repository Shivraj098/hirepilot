"use server";

import { prisma } from "@/lib/db/prisma";

export async function rankJobsForUser(
  userId: string
) {
  const jobs =
    await prisma.job.findMany({
      where: { userId },

      include: {
        applications: true,
        skillGaps: true,
        matchResults: true,
      },
    });

  return jobs
    .map((job) => {
      const application =
        job.applications[0];

      const match =
        job.matchResults[0];

      // status score
      let statusScore = 40;

      if (application?.status === "APPLIED")
        statusScore = 70;

      if (
        application?.status ===
        "INTERVIEW"
      )
        statusScore = 90;

      if (
        application?.status === "OFFER"
      )
        statusScore = 100;

      // match score
      const matchScore =
        match?.matchScore ?? 50;

      // skill gap penalty
      const gapPenalty =
        job.skillGaps.length * 5;

      const score =
        statusScore +
        matchScore -
        gapPenalty;

      return {
        job,
        rankScore: score,
      };
    })
    .sort(
      (a, b) =>
        b.rankScore - a.rankScore
    );
}