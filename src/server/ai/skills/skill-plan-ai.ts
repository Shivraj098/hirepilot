import { runAI } from "./orchestrator";

export async function generateLearningPlan(
  missingSkills: string[],
  jobDescription: string
) {
  const prompt = `
Create learning roadmap.

Return JSON:

[
 {
  skill: string,
  priority: string,
  estimatedTime: string,
  reason: string,
  resources: string[]
 }
]

Missing skills:
${missingSkills.join(", ")}

Job:
${jobDescription}
`;

  return runAI(prompt);
}