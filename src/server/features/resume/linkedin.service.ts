"use server";

import { prisma } from "@/lib/db/prisma";
import { analyzeLinkedin } from "@/server/actions/ai-tools.action";
import { analyzeLinkedinProfile } from "@/server/ai/resume/linkedin-analyzer";

export async function analyzeLinkedinProfile(
  userId: string,
  rawText: string
) {
  const analysis = await analyzeLinkedin(rawText);

  return prisma.linkedinProfile.create({
    data: {
      userId,
      rawText,
      analysis,
      score: analysis?.score ?? null,
    },
  });
}