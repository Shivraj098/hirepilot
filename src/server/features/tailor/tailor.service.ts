"use server";

import { prisma } from "@/lib/db/prisma";

export async function saveTailorResult(data: {
  baseVersionId: string;
  newVersionId: string;
  jobId: string;
  userId: string;
}) {
  return prisma.tailorResult.create({
    data,
  });
}