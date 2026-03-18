"use server";
import { applySuggestionAndCreateVersion } from "../services/suggestion.service";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recalculateATS } from "@/server/ai/recalculate-ats";
import { logActivity } from "@/server/features/activity/activity.service";
export async function applySuggestion(suggestionId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");
  const newVersion = await applySuggestionAndCreateVersion({
    suggestionId,
    userId: user.id,
  });

  await logActivity({
    userId: user.id,
    type: "VERSION_UPDATED",
    message: "Version updated after applying suggestion",
  });
  await recalculateATS(newVersion.id);

  revalidatePath(`/dashboard/jobs/${newVersion.jobId}`);
}
