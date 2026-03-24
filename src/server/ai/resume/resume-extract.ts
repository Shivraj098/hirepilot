import { aiJsonCompletion } from "../core/client";
import { ResumeContent } from "@/server/types/resume.types";

const SYSTEM_PROMPT = `You are a resume parser that extracts structured information 
from resume text with high accuracy.
You always respond with valid JSON only.`;

export async function extractResumeJson(
  text: string
): Promise<ResumeContent | null> {
  if (!text || text.trim().length < 50) return null;

  const userPrompt = `Extract structured information from this resume text.

RESUME TEXT:
${text.slice(0, 4000)}

Return this exact JSON structure:
{
  "summary": <professional summary or objective, empty string if not found>,
  "skills": [<array of all technical and professional skills mentioned>],
  "experience": [
    {
      "company": <company name>,
      "role": <job title>,
      "duration": <employment period e.g. "Jan 2022 - Present">,
      "description": <responsibilities and achievements as a single string>
    }
  ],
  "education": [
    {
      "institution": <school/university name>,
      "degree": <degree and field of study>,
      "duration": <study period e.g. "2018 - 2022">
    }
  ]
}

RULES:
- Extract ALL skills mentioned anywhere in the resume
- If a field is not found, use empty string or empty array
- Preserve the original wording for descriptions
- education duration should include graduation year if available`;

  return aiJsonCompletion<ResumeContent>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.1,
  });
}