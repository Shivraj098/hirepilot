"use server";

import { prisma } from "@/lib/db/prisma";

export async function getResumeTimeline(
  resumeId: string,
  userId: string
) {
  return prisma.activity.findMany({
    where: {
      userId,
      entityType: "resume",
      entityId: resumeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}