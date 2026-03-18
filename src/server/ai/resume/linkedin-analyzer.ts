import { runAI } from "@/server/ai/orchestrator";

export async function analyzeLinkedinProfile(
  text: string
) {
  const prompt = `
Analyze LinkedIn profile.

Return JSON:

{
 score: number,
 strengths: string[],
 weaknesses: string[],
 suggestedSkills: string[]
}

Profile:
${text}
`;

  return runAI(prompt);
}