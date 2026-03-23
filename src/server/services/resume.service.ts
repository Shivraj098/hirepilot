// Canonical implementation lives in server/features/version/version.service.ts
export {
  getLatestVersion,
  getVersions,
  getVersionById,
} from "@/server/features/version/version.service";

import { prisma } from "@/lib/db/prisma";
import { Prisma, VersionType, CreatedBy } from "@prisma/client";

export async function createResumeVersion(params: {
  resumeId: string;
  userId: string;
  content: unknown;
  jobId?: string;
  parentId?: string;
  versionType: VersionType;
  createdBy?: CreatedBy;
  label?: string;
}) {
  return prisma.resumeVersion.create({
    data: {
      resumeId: params.resumeId,
      userId: params.userId,
      content: params.content as Prisma.InputJsonValue,
      jobId: params.jobId,
      parentId: params.parentId,
      versionType: params.versionType,
      createdBy: params.createdBy ?? CreatedBy.SYSTEM,
      label: params.label,
    },
  });
}