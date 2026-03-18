import { aiJsonCompletion } from "../core/orchestrator";

export interface ExtractedJob {
  title: string;
  company?: string;
  description: string;
  skills: string[];
  location?: string;
}

export async function extractJobFromText(
  text: string,
): Promise<ExtractedJob | null> {
  const prompt = `
Extract job information from the text below.

Return JSON:

{
  "title": "",
  "company": "",
  "description": "",
  "skills": [],
  "location": ""
}

TEXT:
${text}
`;

  const result = await aiJsonCompletion<ExtractedJob>(prompt);

  return result;
}
