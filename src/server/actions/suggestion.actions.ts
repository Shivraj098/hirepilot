"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { calculateSkillGap } from "@/server/ai/skill-gap";

export async function applySuggestion(suggestionId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id: suggestionId },
    include: { resumeVersion: true },
  });

  if (!suggestion) throw new Error("Suggestion not found");
  if (suggestion.resumeVersion.userId !== user.id)
    throw new Error("Forbidden");

  const resumeVersion = suggestion.resumeVersion;
  if (!resumeVersion.jobId)
    throw new Error("No job linked to this resume version");

  const content = (resumeVersion.content ?? {}) as Record<string, unknown>;
  const updatedContent = {
    ...content,
    [suggestion.section]: suggestion.suggestedContent,
  };

  await prisma.resumeVersion.update({
    where: { id: resumeVersion.id },
    data: { content: updatedContent as Prisma.InputJsonValue },
  });

  await prisma.aISuggestion.update({
    where: { id: suggestionId },
    data: { applied: true },
  });

  const job = await prisma.job.findFirst({
    where: { id: resumeVersion.jobId, userId: user.id },
  });

  if (!job) throw new Error("Job not found");

  const skillGap = calculateSkillGap(updatedContent, job.description);

  await prisma.aTSResult.upsert({
    where: { resumeVersionId: resumeVersion.id },
    update: {
      score: skillGap.matchPercentage,
      matchedKeywords: skillGap.matchedSkills,
      missingKeywords: skillGap.missingSkills,
      weakKeywords: [],
    },
    create: {
      resumeVersionId: resumeVersion.id,
      score: skillGap.matchPercentage,
      matchedKeywords: skillGap.matchedSkills,
      missingKeywords: skillGap.missingSkills,
      weakKeywords: [],
    },
  });

  revalidatePath(`/dashboard/jobs/${resumeVersion.jobId}`);
}