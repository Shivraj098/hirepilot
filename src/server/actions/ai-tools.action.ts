"use server";
import { urlToText } from "../utils/url-to-text";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

import { analyzePortfolio } from "@/server/ai/resume/portfolio-analyzer";

import { logActivity } from "@/server/features/activity/activity.service";
import { analyzeLinkedinService } from "../features/resume/linkedin.service";

type PortfolioResult = {
  score?: number;
};

/* ================================
   LINKEDIN ANALYSIS
================================ */

export async function analyzeLinkedin(input: string) {
  const user = await getCurrentUser();

  if (!user?.id) throw new Error("Unauthorized");

  return analyzeLinkedinService(user.id, input);
}

/* ================================
   PORTFOLIO ANALYSIS
================================ */

export async function analyzePortfolioAction(input: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const text = await urlToText(input);

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
