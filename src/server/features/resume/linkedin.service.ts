"use server";

import { prisma } from "@/lib/db/prisma";
import { logActivity } from "../activity/activity.service";
import { analyzeLinkedinProfile } from "@/server/ai/resume/linkedin-analyzer";

export async function analyzeLinkedinService(userId: string, input: string) {
  const analysis = await analyzeLinkedinProfile(input);

  if (!analysis) {
    throw new Error(
      "Failed to analyze LinkedIn profile. Please check the URL and try again.",
    );
  }

  const saved = await prisma.linkedinProfile.create({
    data: {
      userId,
      rawText: input,
      analysis,
      score: analysis?.score ?? null,
    },
  });

   logActivity({
    userId,
    type: "ANALYZE_LINKEDIN",
    message: "Linkedin profile analyzed",
  });

  return saved;
}
