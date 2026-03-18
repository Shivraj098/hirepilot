import { runAI } from "./orchestrator";

export async function generateJobInsights(
  resume: unknown,
  job: string
) {
  const prompt = `
Explain job fit.

Return JSON:

{
 strengths: string[],
 risks: string[],
 shouldApplyReason: string,
 improvementTips: string[]
}

Resume:
${JSON.stringify(resume)}

Job:
${job}
`;

  return runAI(prompt);
}