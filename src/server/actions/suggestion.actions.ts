"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { recalculateATS } from "@/server/ai/recalculate-ats";
import { logActivity } from "@/server/features/activity/activity.service";
export async function applySuggestion(suggestionId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id: suggestionId },
    include: { resumeVersion: true },
  });

  if (!suggestion) throw new Error("Suggestion not found");

  if (suggestion.resumeVersion.userId !== user.id) throw new Error("Forbidden");

  const resumeVersion = suggestion.resumeVersion;

  if (!resumeVersion.jobId)
    throw new Error("No job linked to this resume version");

  const content = (resumeVersion.content ?? {}) as Record<string, unknown>;

  const updatedContent = {
    ...content,
    [suggestion.section]: suggestion.suggestedContent,
  };

  // ✅ update content
const newVersion = await prisma.resumeVersion.create({
  data: {
    resumeId: resumeVersion.resumeId,
    userId: user.id,
    jobId: resumeVersion.jobId,
    content: updatedContent as Prisma.InputJsonValue,

    parentId: resumeVersion.id,

    versionType: resumeVersion.versionType,

    createdBy: "USER",
    label: "After suggestion",
  },
});

  // mark suggestion applied
  await prisma.aISuggestion.update({
    where: { id: suggestionId },
    data: { applied: true },
  });

  const job = await prisma.job.findFirst({
    where: {
      id: resumeVersion.jobId,
      userId: user.id,
    },
  });

  if (!job) throw new Error("Job not found");

  // =====================
  // SAVE ATS
  // =====================

  await logActivity({
    userId: user.id,
    type: "VERSION_UPDATED",
    message: "Version updated after applying suggestion",
  });
  await recalculateATS(newVersion.id);

  revalidatePath(`/dashboard/jobs/${resumeVersion.jobId}`);
}
