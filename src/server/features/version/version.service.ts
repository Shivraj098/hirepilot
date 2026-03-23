import { prisma } from "@/lib/db/prisma";
import { VersionType } from "@prisma/client";

export async function getLatestVersion(
  resumeId: string,
  userId: string
) {
  return prisma.resumeVersion.findFirst({
    where: {
      resumeId,
      userId,
      versionType: VersionType.BASE,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVersions(
  resumeId: string,
  userId: string
) {
  return prisma.resumeVersion.findMany({
    where: { resumeId, userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVersionById(
  versionId: string,
  userId: string
) {
  return prisma.resumeVersion.findFirst({
    where: { id: versionId, userId },
  });
}