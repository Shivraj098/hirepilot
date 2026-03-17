"use server";
import {
  createApplication,
  updateApplicationStatus,
} from "@/server/features/application/application.service";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/server/features/activity/activity.service";
import { getLatestVersion } from "@/server/features/version/version.service";

export async function applyToJob(resumeId: string, jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const version = await getLatestVersion(resumeId, user.id);

  if (!version) throw new Error("No version");

  const app = await createApplication({
    userId: user.id,
    jobId,
    resumeVersionId: version.id,
  });

  await logActivity({
    userId: user.id,
    type: "JOB_APPLIED",
    message: "Applied to job",
    entityType: "job",
    entityId: jobId,
  });

  return app;
}

export async function changeApplicationStatus(
  applicationId: string,
  status: string,
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  await updateApplicationStatus({
    applicationId,
    status,
  });

  await logActivity({
    userId: user.id,
    type: "APPLICATION_STATUS",
    message: `Application status → ${status}`,
  });
}
