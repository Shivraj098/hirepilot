import { runAI } from "../core/orchestrator";

export type JobScoreResult = {
  score: number;
  difficulty: string;
  growthPotential: string;
  salaryLevel: string;
  competitionLevel: string;
  summary: string;
};

export async function calculateJobScore(
  jobDescription: string,
): Promise<JobScoreResult | null> {
  const prompt = `
You are a job evaluator.

Return JSON:

{
 score: number,
 difficulty: string,
 growthPotential: string,
 salaryLevel: string,
 competitionLevel: string,
 summary: string
}

Job:
${jobDescription}
`;

  return runAI<JobScoreResult>(prompt);
}
