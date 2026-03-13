import { prisma } from "@/lib/db/prisma";

type DashboardStats = {
  resumeCount: number;
  jobCount: number;
  avgScore: number;
  applications: number;
  interviews: number;
  savedJobs: number;
  favoriteJobs: number;
};

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {

  // -------- resumes --------

  const resumeCount =
    await prisma.resume.count({
      where: {
        userId,
      },
    });

  // -------- jobs --------

  const jobCount =
    await prisma.job.count({
      where: {
        userId,
      },
    });

  // -------- scores --------

  const versions =
    await prisma.resumeVersion.findMany({
      where: {
        userId,
        scoreSnapshot: {
          not: null,
        },
      },
      select: {
        scoreSnapshot: true,
      },
    });

  let avgScore = 0;

  if (versions.length > 0) {
    const total =
      versions.reduce(
        (sum, v) =>
          sum +
          (v.scoreSnapshot ?? 0),
        0
      );

    avgScore =
      Math.round(
        total /
          versions.length
      );
  }

  // -------- applications --------

  const applications =
    await prisma.jobApplication.count({
      where: {
        userId,
      },
    });

  // -------- interviews --------

  const interviews =
    await prisma.job.count({
      where: {
        userId,
        interviewAt: {
          not: null,
        },
      },
    });

  // -------- saved jobs --------

  const savedJobs =
    await prisma.job.count({
      where: {
        userId,
        status: "SAVED",
      },
    });

  // -------- favorite --------

  const favoriteJobs =
    await prisma.job.count({
      where: {
        userId,
        isFavorite: true,
      },
    });

  return {
    resumeCount,
    jobCount,
    avgScore,
    applications,
    interviews,
    savedJobs,
    favoriteJobs,
  };
}