import { aiJsonCompletion } from "@/server/ai/core/client";

type SkillGapResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

type GeneratedGap = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  reasoning: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  learningLink?: string;
};

type AIGap = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  reasoning: string;

  difficulty?: "EASY" | "MEDIUM" | "HARD";
  learningLink?: string;
};

/*
========================================
AI generator
========================================
*/

async function generateSkillGapsAI(
  jobDescription: string,
  skillGap: SkillGapResult,
): Promise<GeneratedGap[] | null> {
  if (!skillGap.missingSkills.length) {
    return [];
  }

  const prompt = `
You are an AI career coach.

Generate a learning roadmap.

Return JSON array.

Format:

[
 {
  "skill": string,
  "priority": "HIGH | MEDIUM | LOW",
  "estimatedTime": string,
  "difficulty": "EASY | MEDIUM | HARD",
  "reasoning": string,
  "learningLink": string
 }
]

Missing skills:
${skillGap.missingSkills.join(", ")}

Job description:
${jobDescription}
`;
  const result = await aiJsonCompletion<AIGap[]>(prompt, { temperature: 0.3 });

  if (!result) {
    return null;
  }

  return result.map((r) => ({
    skill: r.skill,
    priority: r.priority,
    estimatedTime: r.estimatedTime,
    reasoning: r.reasoning,
    difficulty: r.difficulty ?? "MEDIUM",
    learningLink: r.learningLink ?? "",
  }));
}

/*
========================================
Fallback (safe)
========================================
*/

function fallbackSkillGaps(skillGap: SkillGapResult): GeneratedGap[] {
  return skillGap.missingSkills.map((skill) => ({
    skill,
    priority: "MEDIUM",
    estimatedTime: "1-2 weeks",
    reasoning: `${skill} missing from resume`,
    difficulty: "MEDIUM",
    learningLink: "",
  }));
}

/*
========================================
Main
========================================
*/

export async function generateSkillGaps(
  jobDescription: string,
  skillGap: SkillGapResult,
): Promise<GeneratedGap[]> {
  const ai = await generateSkillGapsAI(jobDescription, skillGap);

  if (ai && ai.length > 0) {
    return ai;
  }

  return fallbackSkillGaps(skillGap);
}
