import { prisma } from "@/lib/db/prisma";
import { JobStatus } from "@prisma/client";

export async function createApplication(data: {
  userId: string;
  jobId: string;
  resumeVersionId: string;
}) {
  const existing = await prisma.jobApplication.findFirst({
    where: {
      userId: data.userId,
      jobId: data.jobId,
    },
  });

  if (existing) return existing;

  return prisma.jobApplication.create({
    data: {
      ...data,
      status: JobStatus.APPLIED,
    },
  });
}

export async function updateApplicationStatus(data: {
  applicationId: string;
  userId: string;
  status: JobStatus;
}) {
  const app = await prisma.jobApplication.findFirst({
    where: {
      id: data.applicationId,
      userId: data.userId,
    },
  });

  if (!app) throw new Error("Application not found");

  return prisma.jobApplication.update({
    where: { id: data.applicationId },
    data: { status: data.status },
  });
}

export async function getUserApplications(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          status: true,
        },
      },
      resumeVersion: {
        select: {
          id: true,
          label: true,
          versionType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}