"use server";

import { applySuggestionAndCreateVersion } from "../services/suggestion.service";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/server/features/activity/activity.service";
import { recalculateResumePipeline } from "../orchestrators/resume-orchestrator";

export async function applySuggestion(suggestionId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const newVersion = await applySuggestionAndCreateVersion({
    suggestionId,
    userId: user.id,
  });

  logActivity({
    userId: user.id,
    type: "VERSION_UPDATED",
    message: "Version updated after applying suggestion",
  });

  // Run pipeline without blocking response
  recalculateResumePipeline(newVersion.id, user.id).catch(() => {});

  if (newVersion.jobId) {
    revalidatePath(`/dashboard/jobs/${newVersion.jobId}`);
  }

  revalidatePath(`/dashboard/resumes/${newVersion.resumeId}`);
}