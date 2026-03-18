"use server";

import { prisma } from "@/lib/db/prisma";

export async function getPipelineStats(
  userId: string
) {
  const apps =
    await prisma.jobApplication.findMany({
      where: { userId },
    });

  const interviews =
    apps.filter(
      (a) => a.status === "INTERVIEW"
    ).length;

  const offers =
    apps.filter(
      (a) => a.status === "OFFER"
    ).length;

  const rejected =
    apps.filter(
      (a) => a.status === "REJECTED"
    ).length;

  return {
    total: apps.length,
    interviews,
    offers,
    rejected,
  };
}