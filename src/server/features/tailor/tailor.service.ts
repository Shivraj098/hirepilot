import { prisma } from "@/lib/db/prisma";

export async function saveTailorResult(data: {
  baseVersionId: string;
  newVersionId: string;
  jobId: string;
  userId: string;
}) {
  return prisma.tailorResult.upsert({
    where: {
      baseVersionId_newVersionId: {
        baseVersionId: data.baseVersionId,
        newVersionId: data.newVersionId,
      },
    },
    update: {},
    create: data,
  });
}