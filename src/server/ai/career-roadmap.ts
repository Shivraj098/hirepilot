import { aiJsonCompletion } from "./client";

export type CareerStep = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  resources: string[];
  reasoning: string;
};

export async function generateCareerRoadmap(
  missingSkills: string[],
  jobDescription: string
): Promise<CareerStep[]> {
  if (missingSkills.length === 0) return [];

  const prompt = `
You are an AI career coach.

Create a learning roadmap for these missing skills.

Return JSON array.

Format:

[
 {
  "skill": string,
  "priority": "HIGH | MEDIUM | LOW",
  "estimatedTime": string,
  "difficulty": "EASY | MEDIUM | HARD",
  "resources": string[],
  "reasoning": string
 }
]

Missing skills:
${missingSkills.join(", ")}

Job:
${jobDescription}
`;

  const result =
    await aiJsonCompletion<CareerStep[]>(
      prompt,
      { temperature: 0.3 }
    );

  if (!result) return [];

  return result;
}