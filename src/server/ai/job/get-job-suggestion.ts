import { prisma } from "@/lib/db/prisma";
import { generateJobSuggestions } from "./job-suggestions";

export async function getSuggestionsForVersion(
  versionId: string
) {

  const version =
    await prisma.resumeVersion.findUnique({
      where: {
        id: versionId,
      },
    });

  if (!version) return null;

  return generateJobSuggestions(
    version.content
  );
}