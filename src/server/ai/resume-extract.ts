import { aiJsonCompletion } from "./client";

export interface ResumeJson {
  summary: string;
  skills: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experience: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  education: any[];
}

export async function extractResumeJson(
  text: string,
): Promise<ResumeJson | null> {
  const prompt = `
Convert this resume text into JSON.

Return JSON:

{
  "summary": "",
  "skills": [],
  "experience": [],
  "education": []
}

TEXT:
${text}
`;

  return aiJsonCompletion<ResumeJson>(prompt);
}
