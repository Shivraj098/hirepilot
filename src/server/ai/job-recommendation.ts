import { runAI } from "./orchestrator";

export async function suggestJobsForUser(
  resume: unknown
) {
  const prompt = `
Suggest job roles.

Return JSON:

{
 roles: string[],
 skillsToFocus: string[],
 industries: string[]
}

Resume:
${JSON.stringify(resume)}
`;

  return runAI(prompt);
}