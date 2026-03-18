import { aiJsonCompletion } from "./core/client";
import { parseResumeContent } from "../utils/resume-parser";

export type JobSuggestions = {
  map: any;
  length: number;
  roles: string[];

  keywords: string[];

  industries: string[];

  tips: string[];
};

export async function generateJobSuggestions(
  resumeContent: unknown,
): Promise<JobSuggestions | null> {
  const resume = parseResumeContent(resumeContent);

  const prompt = `
You are an AI career advisor.

Suggest suitable job roles based on resume.

Return JSON.

Format:

{
  "roles": string[],
  "keywords": string[],
  "industries": string[],
  "tips": string[]
}

Resume:
${JSON.stringify(resume, null, 2)}
`;

  const result = await aiJsonCompletion<JobSuggestions>(prompt, {
    temperature: 0.3,
  });

  return result;
}
