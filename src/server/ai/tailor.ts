import { runAI } from "./orchestrator";
import { parseResumeContent } from "../utils/resume-parser";
import { calculateATS } from "./ats-engine";

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
  jobDescription: string,
): Promise<ResumeContent> {
  const parsed = parseResumeContent(resumeContent);

  const ats = calculateATS(parsed, jobDescription);

  const prompt = `
You are an expert resume optimizer.

Rewrite resume to better match job.

Rules:

- Keep JSON format
- Do not remove fields
- Improve summary
- Rewrite experience bullets
- Reorder skills by importance
- Inject missing keywords naturally
- Optimize for ATS

ATS score: ${ats.score}

Missing skills:
${ats.missingKeywords.join(", ")}

Resume:
${JSON.stringify(parsed, null, 2)}

Job:
${jobDescription}

Return JSON only.
`;

  try {
    const result = await runAI<ResumeContent>(prompt, {
      temperature: 0.2,
    });

    if (!result) return parsed;

    return {
      summary: result.summary ?? parsed.summary,

      skills: result.skills ?? parsed.skills,

      experience: result.experience ?? parsed.experience,

      education: result.education ?? parsed.education,
    };
  } catch {
    return parsed;
  }
}
