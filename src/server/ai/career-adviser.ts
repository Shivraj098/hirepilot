import { runAI } from "./core/orchestrator";

export async function careerAdvisor(
  resume: unknown
) {
  const prompt = `
You are career advisor.

Return JSON:

{
 careerLevel: string,
 bestRoles: string[],
 missingSkills: string[],
 salaryRange: string,
 advice: string[]
}

Resume:
${JSON.stringify(resume)}
`;

  return runAI(prompt);
}