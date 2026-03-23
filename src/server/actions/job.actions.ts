"use server";

import { calculateJobScore } from "../ai/job/job-score";
import { analyzeJob } from "../ai/job/job-intelligence";
import { saveJobAnalysis } from "../features/analysis/analysis.service";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { JobStatus } from "@prisma/client";
import { logActivity } from "@/server/features/activity/activity.service";
import { assertJobOwner } from "../auth/permissions";
import { jobSchema } from "@/lib/validators/job";
import { z } from "zod";

export async function createJob(data: {
  title: string;
  company: string;
  description: string;
  location?: string;
  jobLink?: string;
}) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      ...parsed.data,
    },
  });

  logActivity({
    userId: user.id,
    type: "JOB_CREATED",
    message: `Job added: ${job.title}`,
    entityType: "job",
    entityId: job.id,
  });

  // Run AI analysis in background — does not block job creation
  Promise.all([analyzeJob(job.description), calculateJobScore(job.description)])
    .then(async ([jobAnalysis, jobScore]) => {
      if (jobAnalysis) {
        await saveJobAnalysis({
          jobId: job.id,
          userId: user.id,
          roleCategory: jobAnalysis.roleCategory,
          requiredLevel: jobAnalysis.requiredLevel,
          difficulty: jobAnalysis.difficulty,
          domain: jobAnalysis.domain,
          importantSkills: jobAnalysis.importantSkills as never,
          secondarySkills: jobAnalysis.secondarySkills as never,
          score: jobScore?.score,
          summary: jobScore?.summary,
        });

        logActivity({
          userId: user.id,
          type: "JOB_ANALYZED",
          message: "Job analyzed with AI",
        });
      }
    })
    .catch(() => {
      // AI analysis failure never blocks job creation
    });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/jobs");

  return job;
}

export async function deleteJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  await assertJobOwner(jobId, user.id);

  await prisma.$transaction(async (tx) => {
    const versions = await tx.resumeVersion.findMany({
      where: { jobId },
      select: { id: true },
    });

    const versionIds = versions.map((v) => v.id);

    if (versionIds.length > 0) {
      await tx.aTSResult.deleteMany({
        where: { resumeVersionId: { in: versionIds } },
      });
      await tx.aISuggestion.deleteMany({
        where: { resumeVersionId: { in: versionIds } },
      });
    }

    await tx.skillGap.deleteMany({ where: { jobId } });
    await tx.interviewPrep.deleteMany({ where: { jobId } });
    await tx.resumeVersion.deleteMany({ where: { jobId } });
    await tx.jobApplication.deleteMany({ where: { jobId } });
    await tx.job.delete({ where: { id: jobId } });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/jobs");
}

export async function updateJobMeta(
  jobId: string,
  data: { status?: JobStatus; notes?: string },
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  await assertJobOwner(jobId, user.id);

  const updateSchema = z.object({
    status: z.nativeEnum(JobStatus).optional(),
    notes: z.string().max(2000).optional(),
  });

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid data");

  const updateData: Record<string, unknown> = {};

  if (parsed.data.status !== undefined) {
    updateData.status = parsed.data.status;
    const now = new Date();
    if (parsed.data.status === "APPLIED") updateData.appliedAt = now;
    if (parsed.data.status === "INTERVIEW") updateData.interviewAt = now;
    if (parsed.data.status === "OFFER") updateData.offerAt = now;
    if (parsed.data.status === "REJECTED") updateData.rejectedAt = now;
  }

  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }

  await prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  logActivity({
    userId: user.id,
    type: "JOB_ANALYZED",
    message: `Job status updated to ${data.status ?? "notes"}`,
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard");
}
