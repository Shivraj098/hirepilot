import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function assertResumeOwner(
  resumeId: string,
  userId: string
) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { userId: true },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.userId !== userId) {
    throw new Error("Unauthorized");
  }
}

export async function assertVersionOwner(
  versionId: string,
  userId: string
) {
  const version = await prisma.resumeVersion.findUnique({
    where: { id: versionId },
    select: { userId: true },
  });

  if (!version) {
    throw new Error("Version not found");
  }

  if (version.userId !== userId) {
    throw new Error("Unauthorized");
  }
}

export async function assertJobOwner(
  jobId: string,
  userId: string
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { userId: true },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.userId !== userId) {
    throw new Error("Unauthorized");
  }
}

export async function getVerifiedUser() {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");
  return user;
}