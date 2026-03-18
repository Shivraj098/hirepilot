import { runAI } from "./orchestrator";

export async function analyzeATSWithAI(
  resume: unknown,
  job: string
) {
  const prompt = `
Review resume for ATS.

Return JSON:

{
 score: number,
 problems: string[],
 missingKeywords: string[],
 formatIssues: string[]
}

Resume:
${JSON.stringify(resume)}

Job:
${job}
`;

  return runAI(prompt);
}