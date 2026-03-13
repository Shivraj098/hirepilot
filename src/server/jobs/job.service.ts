import { prisma } from "@/lib/db/prisma";
import { JobStatus } from "@prisma/client";
import { assertJobOwner } from "../auth/permissions";
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  userId: string
) {
    await assertJobOwner(
  jobId,
  userId
);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any  = {
    status,
  };

  if (status === "APPLIED") {
    data.appliedAt = new Date();
  }

  if (status === "INTERVIEW") {
    data.interviewAt =
      new Date();
  }

  if (status === "OFFER") {
    data.offerAt =
      new Date();
  }

  if (status === "REJECTED") {
    data.rejectedAt =
      new Date();
  }

  return prisma.job.update({
    where: {
      id: jobId,
    },
    data,
  });
}

export async function updateJobNotes(
  jobId: string,
  notes: string,
    userId: string
) {
  await assertJobOwner(
  jobId,
  userId
);

  return prisma.job.update({
    where: { id: jobId },
    data: {
      notes,
    },
  });
}
export async function toggleFavoriteJob(
  jobId: string,
    userId: string
) {
    await assertJobOwner(
  jobId,
  userId
);
  const job =
    await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

  if (!job) return null;

  return prisma.job.update({
    where: {
      id: jobId,
    },
    data: {
      isFavorite:
        !job.isFavorite,
    },
  });
}

export async function linkVersionToJob(
  jobId: string,
  versionId: string
) {
  return prisma.resumeVersion.update(
    {
      where: {
        id: versionId,
      },
      data: {
        jobId,
      },
    }
  );
}