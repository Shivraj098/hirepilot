import { aiJsonCompletion } from "./client";

export type InterviewPrepResult = {
  questions: string[];

  technicalTopics: string[];

  starDrafts: string[];

  difficulty: string;

  category: string;
};

export async function generateInterviewPrep(
  jobDescription: string,
  title: string,
  keywords: string[],
): Promise<InterviewPrepResult | null> {
  const prompt = `
You are interview coach AI.

Generate interview preparation.

Return JSON.

Format:

{
  "questions": string[],
  "technicalTopics": string[],
  "starDrafts": string[],
  "difficulty": string,
  "category": string
}

difficulty = Easy | Medium | Hard
category = Technical | HR | Mixed


Job title:
${title}

Keywords:
${keywords.join(", ")}

Job:
${jobDescription}
`;

  const result = await aiJsonCompletion<InterviewPrepResult>(prompt, {
    temperature: 0.2,
  });

  return result;
}
