"use server";

import { prisma } from "@/lib/db/prisma";

export async function createApplication(data: {
  userId: string;
  jobId: string;
  resumeVersionId: string;
}) {
  return prisma.jobApplication.create({
    data: {
      userId: data.userId,
      jobId: data.jobId,
      resumeVersionId: data.resumeVersionId,
      status: "SAVED",
    },
  });
}

export async function updateApplicationStatus(data: {
  applicationId: string;
  status: string;
}) {
  return prisma.jobApplication.update({
    where: {
      id: data.applicationId,
    },
    data: {
      status: data.status,
    },
  });
}

export async function getUserApplications(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    include: {
      job: true,
      resumeVersion: true,
    },
  });
}