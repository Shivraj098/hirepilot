import { runAI } from "@/server/ai/orchestrator";

export async function analyzePortfolio(
  text: string
) {
  const prompt = `
Analyze developer portfolio.

Return JSON:

{
 score: number,
 projectQuality: string,
 missingSkills: string[],
 suggestions: string[]
}

Portfolio:
${text}
`;

  return runAI(prompt);
}