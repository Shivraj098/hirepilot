import { aiJsonCompletion } from "../core/client";

export interface ExtractedJob {
  title: string;
  company?: string;
  description: string;
  skills: string[];
  location?: string;
}

const SYSTEM_PROMPT = `You are a job posting parser that extracts structured 
information from job posting text with high accuracy.
You always respond with valid JSON only.`;

export async function extractJobFromText(
  text: string
): Promise<ExtractedJob | null> {
  if (!text || text.trim().length < 100) return null;

  const userPrompt = `Extract job information from this job posting.

JOB POSTING TEXT:
${text.slice(0, 4000)}

Return this exact JSON structure:
{
  "title": <exact job title>,
  "company": <company name or empty string if not found>,
  "description": <full job description including requirements and responsibilities>,
  "skills": [<all technical skills and tools mentioned>],
  "location": <location or "Remote" or empty string if not found>
}

RULES:
- title must be the actual job title, not a generic description
- description should include all requirements and responsibilities
- skills should include programming languages, frameworks, tools, and methodologies`;

  return aiJsonCompletion<ExtractedJob>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.1,
  });
}
