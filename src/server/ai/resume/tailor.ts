import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "./ats-engine";
import { parseResumeContent } from "@/server/utils/resume-parser";
import { ResumeContent } from "@/server/types/resume.types";
import { logError } from "@/server/utils/logger";

const SYSTEM_PROMPT = `You are an expert resume optimizer specializing in ATS optimization 
and tailoring resumes for specific job descriptions.

You improve resumes by rewriting content to better match job requirements while 
maintaining complete honesty — you never fabricate experience or skills.
You always respond with valid JSON only.`;

export async function tailorResumeWithAI(
  resumeContent: ResumeContent,
  jobDescription: string,
  userId?: string
): Promise<{ content: ResumeContent; improvements: string[] }> {
  const parsed = parseResumeContent(resumeContent);
  const ats = calculateATS(parsed, jobDescription);

  const userPrompt = `Tailor this resume to better match the job description.

CURRENT ATS SCORE: ${ats.score}/100
MISSING KEYWORDS: ${ats.missingKeywords.slice(0, 20).join(", ")}
WEAK AREAS: ${ats.weakKeywords.slice(0, 10).join(", ")}

CURRENT RESUME:
${JSON.stringify(parsed, null, 2)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return this exact JSON structure:
{
  "resume": {
    "summary": <rewritten summary incorporating relevant keywords naturally>,
    "skills": <reordered and supplemented skills array — only add skills plausible given experience>,
    "experience": <experience array with bullets rewritten to highlight relevant achievements>,
    "education": <unchanged education array>
  },
  "improvements": [<3-5 specific changes made and why each improves the match>]
}

STRICT RULES:
- Never add skills or experience the candidate does not have
- Only reorder, reword, and emphasize existing content
- Inject missing keywords naturally into existing experience descriptions
- Reorder skills to put most relevant ones first
- Improve summary to mention the target role and key required skills
- Each experience bullet should quantify impact where possible`;

  try {
    const result = await runAI<{
      resume: ResumeContent;
      improvements: string[];
    }>(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.2,
      userId,
      skipCache: true, // Always fresh tailor
    });

    if (!result?.resume) {
      return { content: parsed, improvements: [] };
    }

    return {
      content: {
        summary: result.resume.summary ?? parsed.summary,
        skills: result.resume.skills ?? parsed.skills,
        experience: result.resume.experience ?? parsed.experience,
        education: result.resume.education ?? parsed.education,
      },
      improvements: result.improvements ?? [],
    };
  } catch (err) {
    logError("Resume tailor failed", err);
    return { content: parsed, improvements: [] };
  }
}