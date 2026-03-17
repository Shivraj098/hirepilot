"use server";

import { prisma } from "@/lib/db/prisma";

export async function compareVersions(
  versionAId: string,
  versionBId: string
) {
  const v1 = await prisma.resumeVersion.findUnique({
    where: { id: versionAId },
  });

  const v2 = await prisma.resumeVersion.findUnique({
    where: { id: versionBId },
  });

  if (!v1 || !v2) {
    throw new Error("Version not found");
  }

  return {
    v1,
    v2,
  };
}