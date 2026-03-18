import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function applySuggestionAndCreateVersion(params: {
  suggestionId: string;
  userId: string;
}) {
  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id: params.suggestionId },
    include: { resumeVersion: true },
  });

  if (!suggestion) throw new Error("Suggestion not found");

  if (suggestion.resumeVersion.userId !== params.userId) {
    throw new Error("Unauthorized");
  }

  const base = suggestion.resumeVersion;

  const content = (base.content ?? {}) as Record<string, unknown>;

  const updatedContent = {
    ...content,
    [suggestion.section]: suggestion.suggestedContent,
  };

  const newVersion = await prisma.resumeVersion.create({
    data: {
      resumeId: base.resumeId,
      userId: params.userId,
      jobId: base.jobId,
      content: updatedContent as Prisma.InputJsonValue,

      parentId: base.id,
      versionType: base.versionType,

      createdBy: "USER",
      label: "After suggestion",
    },
  });

  await prisma.aISuggestion.update({
    where: { id: params.suggestionId },
    data: { applied: true },
  });

  return newVersion;
}