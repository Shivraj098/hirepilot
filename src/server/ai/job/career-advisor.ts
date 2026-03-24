import { runAI } from "../core/orchestrator";
import { CareerAdvice } from "@/server/types/ai.types";

const SYSTEM_PROMPT = `You are a senior career advisor specializing in tech industry careers. 
You provide honest, actionable career guidance based on resume analysis.
You always respond with valid JSON only.`;

export async function careerAdvisor(
  resume: unknown,
  userId?: string
): Promise<CareerAdvice | null> {
  const userPrompt = `Analyze this resume and provide career guidance.

RESUME:
${JSON.stringify(resume, null, 2)}

Return this exact JSON structure:
{
  "careerLevel": <"Junior" | "Mid" | "Senior" | "Lead">,
  "bestRoles": [<5 most suitable job titles based on the resume>],
  "missingSkills": [<5 skills that would most advance this person's career>],
  "salaryRange": <realistic salary range e.g. "$80,000 - $110,000">,
  "advice": [<3-5 specific, actionable career development tips>]
}`;

  return runAI<CareerAdvice>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.3,
    userId,
    ttlHours: 24,
  });
}