import { runAI } from "../core/orchestrator";
import { JobScoreResult } from "@/server/types/ai.types";

const SYSTEM_PROMPT = `You are a job market analyst. You evaluate job postings and score them 
based on growth potential, difficulty, and market competitiveness. 
You always respond with valid JSON only.`;

export async function calculateJobScore(
  jobDescription: string
): Promise<JobScoreResult | null> {
  if (!jobDescription || jobDescription.trim().length < 50) return null;

  const userPrompt = `Evaluate this job posting and provide a comprehensive score.

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return this exact JSON structure:
{
  "score": <number 0-100, overall job attractiveness>,
  "difficulty": <"Easy" | "Medium" | "Hard">,
  "growthPotential": <"Low" | "Medium" | "High" | "Very High">,
  "salaryLevel": <"Below Market" | "Market Rate" | "Above Market" | "Premium">,
  "competitionLevel": <"Low" | "Medium" | "High" | "Very High">,
  "summary": <2-3 sentences summarizing what makes this role attractive or challenging>
}

SCORING RULES:
- score 80+ only for roles with strong growth, good pay, and reasonable requirements
- difficulty based on years of experience and tech stack complexity
- growthPotential based on company type, role, and industry trends`;

  return runAI<JobScoreResult>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    ttlHours: 48,
  });
}