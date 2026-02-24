import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MissingSkill = string;

export type AISkillGap = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  reasoning: string;
};

export async function generateAISkillGaps(
  jobDescription: string,
  missingSkills: MissingSkill[]
): Promise<AISkillGap[]> {
  if (missingSkills.length === 0) return [];

  const prompt = `
You are an expert career advisor.

Job Description:
${jobDescription}

Missing Skills:
${missingSkills.join(", ")}

For each missing skill:
- Assign priority (HIGH, MEDIUM, LOW)
- Estimate realistic learning time
- Explain reasoning briefly

Return strictly valid JSON array.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a precise JSON-only generator.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;

  if (!content) return [];

  const parsed = JSON.parse(content) as {
    skills: AISkillGap[];
  };

  return parsed.skills;
}