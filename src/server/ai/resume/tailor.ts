import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "./ats-engine";
import { ResumeContent } from "@/server/types/resume.types";
import { logError } from "@/server/utils/logger";
import { buildResumeContext } from "./resume-context";

const SYSTEM_PROMPT = `You are an expert resume optimizer specializing in ATS optimization 
and tailoring resumes for specific job descriptions.

You improve resumes by rewriting content to better match job requirements while 
maintaining complete honesty — you never fabricate experience or skills.
You always respond with valid JSON only.`;

export async function tailorResumeWithAI(
  resumeContent: ResumeContent,
  jobDescription: string,
  userId?: string,
): Promise<{ content: ResumeContent; improvements: string[] }> {
  const context =
  buildResumeContext(
    resumeContent,
  );

const parsed =
  context.parsed;
  const ats = calculateATS(parsed, { jobDescription });

  const userPrompt = `Tailor this resume to better match the job description.

CURRENT ATS SCORE:
${ats.score}/100

SECTION SCORES:
- Skills: ${ats.sectionScores.skills}/100
- Experience: ${ats.sectionScores.experience}/100
- Summary: ${ats.sectionScores.summary}/100

MISSING KEYWORDS:
${ats.missingKeywords.slice(0, 20).join(", ")}

WEAK KEYWORDS:
${ats.weakKeywords.slice(0, 10).join(", ")}

CURRENT RESUME STRUCTURE

-Summary:
${parsed.summary}

-Skills:
${parsed.skills.join(", ")}

-Experience:
${JSON.stringify(parsed.experience, null, 2)}

-Education:
${JSON.stringify(parsed.education, null, 2)}

-JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

PRIMARY OBJECTIVES:

1. Improve ATS score.
2. Preserve complete factual accuracy.
3. Improve readability.
4. Reorder existing content before introducing new content.
5. Make the smallest number of edits necessary.

Return this exact JSON structure:
{
  "resume": {
    "summary": <rewritten summary incorporating relevant keywords naturally>,
  skills:
  <reordered skills array. Only add a new skill if it is clearly supported by the candidate's experience.>    "experience": <experience array with bullets rewritten to highlight relevant achievements>,
    "education": <unchanged education array>
  },
  "improvements": [<3-5 specific changes made and why each improves the match>]
}

STRICT RULES:
- Never add skills or experience the candidate does not have
- Only reorder, reword, and emphasize existing content
- Never fabricate experience with missing keywords.
- Only insert a missing keyword if the existing resume already strongly implies familiarity.
- If a keyword cannot be honestly integrated, leave it unchanged.
- Reorder existing skills before introducing any plausible additions.
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

    const tailored = result.resume;

    const newATS = calculateATS(tailored, { jobDescription });

    if (newATS.score + 3 < ats.score) {
      logError("Tailoring decreased ATS score", {
        before: ats.score,
        after: newATS.score,
      });

      return {
        content: parsed,
        improvements: [],
      };
    }

    return {
      content: {
        summary:
          typeof tailored.summary === "string"
            ? tailored.summary
            : parsed.summary,

        skills: Array.isArray(tailored.skills)
          ? tailored.skills
          : parsed.skills,

        experience: Array.isArray(tailored.experience)
          ? tailored.experience
          : parsed.experience,

        education: Array.isArray(tailored.education)
          ? tailored.education
          : parsed.education,
      },

      improvements: result.improvements ?? [],
    };
  } catch (err) {
    logError("Resume tailor failed", err);
    return { content: parsed, improvements: [] };
  }
}
