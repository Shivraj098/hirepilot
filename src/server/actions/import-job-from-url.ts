"use server";

import { prisma } from "@/lib/db/prisma";

import { urlToText } from "@/server/utils/url-to-text";
import { extractJobFromText } from "@/server/ai/job/job-extract";
import { logActivity } from "@/server/features/activity/activity.service";

export async function importJobFromUrl(
  url: string,
  userId: string
) {
  try {
   const text = await urlToText(url);

   if (!text || text.length < 50) {
  throw new Error("Could not read job page");
}

    // 3 ai extract
    const job =
      await extractJobFromText(
        text
      );

    if (!job) {
      throw new Error(
        "AI could not extract job"
      );
    }

    // 4 save job
    const created =
      await prisma.job.create({
        data: {
          userId,
          title: job.title,
          company:
            job.company ?? "",
          location:
            job.location ?? null,
          jobLink: url,
          description:
            job.description,
        },
      });

      await logActivity({
  userId,
  type: "JOB_IMPORTED",
  message: "Job imported from URL",
});

    return created;
  } catch (err) {
    console.error(
      "IMPORT JOB ERROR",
      err
    );

    return null;
  }
}