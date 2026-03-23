"use server";

import { createResumeVersion } from "@/server/services/resume.service";
import { parsePdf } from "@/server/resume-parser/parse-pdf";
import { parseDocx } from "@/server/resume-parser/parse-docx";
import { extractResumeJson } from "@/server/ai/resume/resume-extract";
import { assertResumeOwner } from "../auth/permissions";
import { getCurrentUser } from "@/lib/auth";
import { recalculateResumePipeline } from "../orchestrators/resume-orchestrator";
import { revalidatePath } from "next/cache";
import { VersionType, CreatedBy } from "@prisma/client";
import { logError } from "@/server/utils/logger";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function uploadResume(file: File, resumeId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  // Auth check FIRST before any processing
  await assertResumeOwner(resumeId, user.id);

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be under 5MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only PDF and DOCX files are supported");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (file.type === "application/pdf") {
      text = await parsePdf(buffer);
    } else {
      text = await parseDocx(buffer);
    }

    if (!text || text.trim().length < 50) {
      throw new Error("Could not extract text from file");
    }

    const json = await extractResumeJson(text);

    if (!json) {
      throw new Error("AI could not parse resume content");
    }

    const version = await createResumeVersion({
      resumeId,
      userId: user.id,
      content: json,
      versionType: VersionType.BASE,
      createdBy: CreatedBy.AI,
    });

    // Run pipeline without blocking response
    recalculateResumePipeline(version.id, user.id).catch(() => {});

    revalidatePath(`/dashboard/resumes/${resumeId}`);

    return version;
  } catch (err) {
    logError("UPLOAD RESUME ERROR", err);
    throw err;
  }
}