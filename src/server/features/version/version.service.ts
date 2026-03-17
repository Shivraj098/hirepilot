"use server";

import { prisma } from "@/lib/db/prisma";

export async function getLatestVersion(
  resumeId: string,
  userId: string
) {
  return prisma.resumeVersion.findFirst({
    where: {
      resumeId,
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getVersions(
  resumeId: string,
  userId: string
) {
  return prisma.resumeVersion.findMany({
    where: {
      resumeId,
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}