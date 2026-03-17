"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { analyzeLinkedinProfile } from "@/server/ai/linkedin-analyzer";
import { logActivity } from "@/server/features/activity/activity.service";

type LinkedinResult = {
  score: number;
}  
export async function analyzeLinkedin(text: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const result = await analyzeLinkedinProfile(text) as LinkedinResult;

  const saved = await prisma.linkedinProfile.create({
    data: {
      userId: user.id,
      rawText: text,
      analysis: result as Prisma.InputJsonValue,
      score: result?.score ?? null,
    },
  });

  
  await logActivity({
    userId: user.id,
    type: "LINKEDIN_ANALYZED",
    message: "LinkedIn profile analyzed",
  });

  return saved;
}


import { analyzePortfolio } from "@/server/ai/portfolio-analyzer";
 
type PortfolioResult = {
  score: number;
}
export async function analyzePortfolioAction(text: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const result = await analyzePortfolio(text) as PortfolioResult;

  const saved = await prisma.portfolioProfile.create({
    data: {
      userId: user.id,
      rawText: text,
      analysis: result as Prisma.InputJsonValue,
      score: result?.score ?? null,
    },
  });

  await logActivity({
    userId: user.id,
    type: "PORTFOLIO_ANALYZED",
    message: "Portfolio analyzed",
  });

  return saved;
}