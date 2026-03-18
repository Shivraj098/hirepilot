"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats(
  userId: string
) {
  const resumeCount =
    await prisma.resume.count({
      where: { userId },
    });

  const jobCount =
    await prisma.job.count({
      where: { userId },
    });

  const applications =
    await prisma.jobApplication.count({
      where: { userId },
    });

  return {
    resumeCount,
    jobCount,
    applications,
  };
}