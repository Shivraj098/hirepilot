import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { checkAIGuard } from "@/server/ai/core/ai-guard";
import { ResumeScoreResult } from "@/server/types/score.types";

export async function calculateResumeScore(
  resumeContent: unknown,
  jobDescription?: string,
  userId?: string,
): Promise<ResumeScoreResult | null> {
  const ats = jobDescription
    ? calculateATS(resumeContent, jobDescription)
    : null;
  if (userId) {
    checkAIGuard(userId);
  }

  const prompt = `
You are an AI resume reviewer.

Score this resume.

Return JSON.

Format:

  "profileScore": number,
  "contentScore": number,
  "skillScore": number,
  "experienceScore": number,
  "atsScore": number,
  "tips": string[]
}

Rules:

Scores must be 0-100

Resume:
${JSON.stringify(resumeContent, null, 2)}

ATS Score:
${ats ? ats.score : 0}
`;

  const result = await runAI<ResumeScoreResult>(prompt, {
    temperature: 0.2,
  });

  return result;
}
