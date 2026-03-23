"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { urlToText } from "@/server/utils/url-to-text";
import { extractJobFromText } from "@/server/ai/job/job-extract";
import { logActivity } from "@/server/features/activity/activity.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logError } from "@/server/utils/logger";

const urlSchema = z.string().url();

export async function importJobFromUrl(url: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) throw new Error("Invalid URL");

  try {
    const text = await urlToText(parsed.data);

    if (!text || text.length < 100) {
      throw new Error("Could not read job page");
    }

    const job = await extractJobFromText(text);

    if (!job || !job.title || !job.description) {
      throw new Error("AI could not extract job details");
    }

    const created = await prisma.job.create({
      data: {
        userId: user.id,
        title: job.title,
        company: job.company ?? "Unknown",
        location: job.location ?? null,
        jobLink: parsed.data,
        description: job.description,
      },
    });

    logActivity({
      userId: user.id,
      type: "JOB_IMPORTED",
      message: `Job imported: ${job.title}`,
      entityType: "job",
      entityId: created.id,
    });

    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");

    return created;
  } catch (err) {
    logError("IMPORT JOB ERROR", err);
    throw err;
  }
}