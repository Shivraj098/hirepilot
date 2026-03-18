import { runAI } from "./orchestrator";

export type JobIntelligence = {
  roleCategory: string;

  requiredLevel: string;

  difficulty: string;

  domain: string;

  importantSkills: string[];

  secondarySkills: string[];

  jobTypeHint: string;
};

export async function analyzeJob(
  jobDescription: string
): Promise<JobIntelligence | null> {
  const prompt = `
You are an AI job analyzer.

Analyze job description.

Return JSON only.

Format:

{
  "roleCategory": string,
  "requiredLevel": string,
  "difficulty": string,
  "domain": string,
  "importantSkills": string[],
  "secondarySkills": string[],
  "jobTypeHint": string
}

Rules:

requiredLevel = Intern | Junior | Mid | Senior
difficulty = Easy | Medium | Hard
domain = Web | Backend | AI | DevOps | Data | Mobile | Other

Job:
${jobDescription}
`;

  const result =
    await runAI<JobIntelligence>(
      prompt,
      {
        temperature: 0.2,
      }
    );

  return result;
}