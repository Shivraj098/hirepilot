"use server";
import { createResumeVersion } from "@/server/services/resume.service";

import { parsePdf } from "@/server/resume-parser/parse-pdf";
import { parseDocx } from "@/server/resume-parser/parse-docx";
import { extractResumeJson } from "@/server/ai/resume-extract";
import { assertResumeOwner } from "../auth/permissions";
import { getCurrentUser } from "@/lib/auth";

export async function uploadResume(file: File, resumeId: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    if (file.type === "application/pdf") {
      text = await parsePdf(buffer);
    } else if (file.type.includes("word")) {
      text = await parseDocx(buffer);
    } else {
      throw new Error("Unsupported file");
    }

    const json = await extractResumeJson(text);

    if (!json) {
      throw new Error("AI parse failed");
    }

    await assertResumeOwner(resumeId, user.id);

    const version = await createResumeVersion({
      resumeId,
      userId: user.id,
      content: json,
      versionType: "BASE",
      createdBy: "AI",
    });

    return version;
  } catch (err) {
    console.error("UPLOAD RESUME ERROR", err);

    return null;
  }
}
