import { runAI } from "@/server/ai/core/orchestrator";

export type JobMatchResult = {
  matchScore: number;

  fitLevel: string;

  shouldApply: boolean;

  reason: string;

  missingSkills: string[];

  improvementHint: string;
};

export async function analyzeJobMatch(
  resumeContent: unknown,
  jobDescription: string
): Promise<JobMatchResult | null> {
  const prompt = `
You are an AI career advisor.

Compare resume with job description.

Return JSON only.

Format:

{
  "matchScore": number,
  "fitLevel": string,
  "shouldApply": boolean,
  "reason": string,
  "missingSkills": string[],
  "improvementHint": string
}

Rules:

matchScore = 0-100

fitLevel =
Poor
Average
Good
Strong
Perfect

shouldApply = true if matchScore >= 60

Resume:
${JSON.stringify(resumeContent, null, 2)}

Job:
${jobDescription}
`;

  const result =
    await runAI<JobMatchResult>(
      prompt,
      {
        temperature: 0.2,
      }
    );

  return result;
}