import { prisma } from "@/lib/db/prisma";
import { compareVersions } from "./version-compare";

export async function compareVersionsById(
  baseId: string,
  newId: string
) {

  const base =
    await prisma.resumeVersion.findUnique({
      where: {
        id: baseId,
      },
    });

  const next =
    await prisma.resumeVersion.findUnique({
      where: {
        id: newId,
      },
    });

  if (!base || !next) {
    return null;
  }

  return compareVersions(
    base.content,
    next.content
  );
}