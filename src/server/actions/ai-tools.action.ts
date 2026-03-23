"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { urlToText } from "../utils/url-to-text";
import { analyzePortfolio } from "@/server/ai/resume/portfolio-analyzer";
import { logActivity } from "@/server/features/activity/activity.service";
import { analyzeLinkedinService } from "../features/resume/linkedin.service";
import { z } from "zod";

const urlSchema = z.string().url();

type PortfolioResult = {
  score?: number;
  projectQuality?: string;
  missingSkills?: string[];
  suggestions?: string[];
};

export async function analyzeLinkedin(input: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  return analyzeLinkedinService(user.id, input);
}

export async function analyzePortfolioAction(input: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const parsed = urlSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid URL");

  const text = await urlToText(parsed.data);

  if (!text || text.length < 100) {
    throw new Error("Could not extract content from URL");
  }

  const result = (await analyzePortfolio(text)) as PortfolioResult;

  const saved = await prisma.portfolioProfile.create({
    data: {
      userId: user.id,
      rawText: text,
      analysis: result as Prisma.InputJsonValue,
      score: result?.score ?? null,
    },
  });

  logActivity({
    userId: user.id,
    type: "PORTFOLIO_ANALYZED",
    message: "Portfolio analyzed",
  });

  return saved;
}