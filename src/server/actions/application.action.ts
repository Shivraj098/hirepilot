"use server";

import {
  createApplication,
  updateApplicationStatus,
} from "@/server/features/application/application.service";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/server/features/activity/activity.service";
import { getLatestVersion } from "@/server/features/version/version.service";
import { assertJobOwner } from "@/server/auth/permissions";
import { JobStatus } from "@prisma/client";
import { z } from "zod";

export async function applyToJob(resumeId: string, jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  await assertJobOwner(jobId, user.id);

  const version = await getLatestVersion(resumeId, user.id);
  if (!version) throw new Error("No resume version found");

  const app = await createApplication({
    userId: user.id,
    jobId,
    resumeVersionId: version.id,
  });

  logActivity({
    userId: user.id,
    type: "JOB_APPLIED",
    message: "Applied to job",
    entityType: "job",
    entityId: jobId,
  });

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${jobId}`);

  return app;
}

export async function changeApplicationStatus(
  applicationId: string,
  status: string
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const parsed = z.nativeEnum(JobStatus).safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  await updateApplicationStatus({
    applicationId,
    userId: user.id,
    status: parsed.data,
  });

  logActivity({
    userId: user.id,
    type: "APPLICATION_STATUS",
    message: `Application status updated to ${status}`,
  });

  revalidatePath("/dashboard/jobs");
}