import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function createResumeVersion(params: {
  resumeId: string;
  userId: string;
  content: unknown;
  jobId?: string;
  parentId?: string;
  versionType: "BASE" | "TAILORED";
  createdBy?: string;
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

      createdBy: params.createdBy ?? "SYSTEM",
      label: params.label,
    },
  });
}