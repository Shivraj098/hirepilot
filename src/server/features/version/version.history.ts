"use server";

import { prisma } from "@/lib/db/prisma";

export async function getVersionHistory(
  resumeId: string,
  userId: string
) {
  return prisma.resumeVersion.findMany({
    where: {
      resumeId,
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}