"use server";
import { calculateJobScore } from "../ai/job/job-score";
import { analyzeJob } from "../ai/job/job-intelligence";
import { saveJobAnalysis } from "../features/analysis/analysis.service";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma, JobStatus } from "@prisma/client";
import { logActivity } from "@/server/features/activity/activity.service";

export async function createJob(data: {
  title: string;
  company: string;
  description: string;
  location?: string;
  jobLink?: string;
}) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  // =========================
  // CREATE JOB
  // =========================

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      title: data.title,
      company: data.company,
      description: data.description,
      location: data.location,
      jobLink: data.jobLink,
    },
  });

  // =========================
  // AI ANALYSIS
  // =========================

  const jobAnalysis = await analyzeJob(job.description);

  const jobScore = await calculateJobScore(job.description);

  if (jobAnalysis) {
    await saveJobAnalysis({
      jobId: job.id,
      userId: user.id,

      roleCategory: jobAnalysis.roleCategory ?? null,

      requiredLevel: jobAnalysis.requiredLevel ?? null,

      difficulty: jobAnalysis.difficulty ?? null,

      domain: jobAnalysis.domain ?? null,

      importantSkills: jobAnalysis.importantSkills ?? [],

      secondarySkills: jobAnalysis.secondarySkills ?? [],

      score: jobScore?.score ?? undefined,

      summary: jobScore?.summary ?? undefined,
    });

    await logActivity({
      userId: user.id,
      type: "JOB_ANALYZED",
      message: "Job analyzed with AI",
    });

    await logActivity({
      userId: user.id,
      type: "JOB_SCORED",
      message: "Job scored",
    });
  }

  // =========================
  // ACTIVITY
  // =========================

  await logActivity({
    userId: user.id,
    type: "JOB_CREATED",
    message: `Job added: ${job.title}`,
    entityType: "job",
    entityId: job.id,
  });

  revalidatePath("/dashboard");

  return job;
}

export async function deleteJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!job) throw new Error("Job not found");

  // get versions linked to job
  const versions = await prisma.resumeVersion.findMany({
    where: { jobId },
    select: { id: true },
  });

  const versionIds = versions.map((v) => v.id);

  // delete ATS results
  await prisma.aTSResult.deleteMany({
    where: {
      resumeVersionId: {
        in: versionIds,
      },
    },
  });

  // delete suggestions
  await prisma.aISuggestion.deleteMany({
    where: {
      resumeVersionId: {
        in: versionIds,
      },
    },
  });

  // delete skill gaps
  await prisma.skillGap.deleteMany({
    where: { jobId },
  });

  // delete interview prep
  await prisma.interviewPrep.deleteMany({
    where: { jobId },
  });

  // delete resume versions
  await prisma.resumeVersion.deleteMany({
    where: { jobId },
  });

  // delete applications
  await prisma.jobApplication.deleteMany({
    where: { jobId },
  });

  // finally delete job
  await prisma.job.delete({
    where: { id: jobId },
  });

  revalidatePath("/dashboard");
}

export async function updateJobMeta(
  jobId: string,
  data: {
    status?: JobStatus;
    notes?: string;
  },
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!job) throw new Error("Job not found");

  const updateData: Prisma.JobUpdateInput = {};

  if (data.status) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
}
