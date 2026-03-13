"use server";

import { prisma } from "@/lib/db/prisma";

import { fetchJobHtml } from "@/server/job-parser/fetch-job";
import { cleanHtmlToText } from "@/server/job-parser/clean-html";
import { extractJobFromText } from "@/server/ai/job-extract";

export async function importJobFromUrl(
  url: string,
  userId: string
) {
  try {
    // 1 fetch html
    const html =
      await fetchJobHtml(url);

    // 2 clean text
    const text =
      cleanHtmlToText(html);

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

    return created;
  } catch (err) {
    console.error(
      "IMPORT JOB ERROR",
      err
    );

    return null;
  }
}