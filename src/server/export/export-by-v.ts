import { prisma } from "@/lib/db/prisma";

import { exportResumePDF } from "./pdf";
import { exportResumeDocx } from "./docx";
import { assertVersionOwner } from "../auth/permissions";
export async function exportResumeByVersion(
  versionId: string,
  type: "pdf" | "docx",
  userId: string
) {
    await assertVersionOwner(
  versionId,
  userId
);

  const version =
    await prisma.resumeVersion.findUnique({
      where: {
        id: versionId,
      },
    });

  if (!version) {
    return null;
  }

  if (type === "pdf") {
    return exportResumePDF(
      version.content
    );
  }

  return exportResumeDocx(
    version.content
  );
}