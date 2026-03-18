"use server";

import { prisma } from "@/lib/db/prisma";

export async function getPipelineInsights(userId: string) {
  const apps = await prisma.jobApplication.findMany({
    where: { userId },
  });

  const total = apps.length;

  const interviews = apps.filter(
    (a) => a.status === "INTERVIEW"
  ).length;

  const offers = apps.filter(
    (a) => a.status === "OFFER"
  ).length;

  return {
    total,
    interviews,
    offers,
    conversionRate:
      total === 0
        ? 0
        : Math.round((offers / total) * 100),
  };
}