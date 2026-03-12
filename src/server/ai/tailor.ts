import { aiJsonCompletion } from "./client";
import { parseResumeContent } from "./utils/resume-parser";

type ExperienceEntry = {
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
};

type EducationEntry = {
  institution?: string;
  degree?: string;
  duration?: string;
};

export type ResumeContent = {
  summary?: string;
  experience?: ExperienceEntry[];
  skills?: string[];
  education?: EducationEntry[];
};

export async function tailorResumeWithAI(
  resumeContent: ResumeContent,
  jobDescription: string
): Promise<ResumeContent> {
  const parsed = parseResumeContent(resumeContent);

  const prompt = `
You are an AI resume optimizer.

Rewrite the resume to better match the job description.

Rules:
- Keep JSON format exactly
- Improve summary
- Reorder skills based on relevance
- Improve experience descriptions
- Do NOT remove fields
- Do NOT add new fields

Return ONLY valid JSON.

Resume:
${JSON.stringify(parsed, null, 2)}

Job:
${jobDescription}
`;

  const result = await aiJsonCompletion<ResumeContent>(
    prompt,
    {
      temperature: 0.3,
    }
  );

  if (!result) {
    return resumeContent;
  }

  return {
    summary: result.summary ?? parsed.summary,
    skills: result.skills ?? parsed.skills,
    experience: result.experience ?? parsed.experience,
    education: result.education ?? parsed.education,
  };
}