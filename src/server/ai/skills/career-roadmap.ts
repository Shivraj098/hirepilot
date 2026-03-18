import { aiJsonCompletion } from "../core/client";
import { urlToText } from "@/server/utils/url-to-text";

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
  jobInput: string,
): Promise<CareerStep[]> {
  if (missingSkills.length === 0) return [];

  const jobDescription = await urlToText(jobInput);

  if (!jobDescription || jobDescription.length < 20) {
    return [];
  }

  const prompt = `
You are an AI career coach.

Create a learning roadmap.

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

  const result = await aiJsonCompletion<CareerStep[]>(prompt, {
    temperature: 0.3,
  });

  if (!result) return [];

  return result;
}
