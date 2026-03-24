import { runAI } from "@/server/ai/core/orchestrator";
import { urlToText } from "@/server/utils/url-to-text";

export type LinkedinAnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestedSkills: string[];
  profileCompleteness: number;
  recommendations: string[];
};

const SYSTEM_PROMPT = `You are a LinkedIn profile optimization expert. 
You analyze profiles and provide specific, actionable feedback to improve 
visibility and appeal to recruiters.
You always respond with valid JSON only.`;

export async function analyzeLinkedinProfile(
  input: string,
  userId?: string
): Promise<LinkedinAnalysisResult | null> {
  const text = await urlToText(input);

  if (!text || text.length < 100) return null;

  const userPrompt = `Analyze this LinkedIn profile and provide optimization feedback.

PROFILE CONTENT:
${text.slice(0, 3000)}

Return this exact JSON structure:
{
  "score": <number 0-100, overall profile strength>,
  "profileCompleteness": <number 0-100, how complete the profile is>,
  "strengths": [<3-5 specific profile strengths>],
  "weaknesses": [<3-5 specific areas needing improvement>],
  "suggestedSkills": [<5-8 skills to add based on experience>],
  "recommendations": [<5 specific actions to improve the profile>]
}`;

  return runAI<LinkedinAnalysisResult>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    userId,
    ttlHours: 12,
  });
}