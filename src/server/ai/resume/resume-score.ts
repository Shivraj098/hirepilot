import { runAI } from "@/server/ai/core/orchestrator";
import { checkAIGuard } from "@/server/ai/core/ai-guard";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { ResumeScoreResult } from "@/server/types/score.types";

const SYSTEM_PROMPT = `You are an expert resume scoring AI trained on thousands of 
successful tech industry resumes. You provide precise, consistent scoring.
You always respond with valid JSON only.`;

export async function calculateResumeScore(
  resumeContent: unknown,
  jobDescription?: string,
  userId?: string
): Promise<ResumeScoreResult | null> {
  // Rate limit check BEFORE any computation
  if (userId) {
    await checkAIGuard(userId);
  }

  const ats = jobDescription
    ? calculateATS(resumeContent, jobDescription)
    : null;

  const userPrompt = `Score this resume across multiple dimensions.

RESUME:
${JSON.stringify(resumeContent, null, 2)}

${ats ? `ATS ANALYSIS:
- ATS Score: ${ats.score}/100
- Matched Keywords: ${ats.matchedKeywords.slice(0, 20).join(", ")}
- Missing Keywords: ${ats.missingKeywords.slice(0, 20).join(", ")}
- Section Scores: Skills ${ats.sectionScores.skills}/100, Experience ${ats.sectionScores.experience}/100, Summary ${ats.sectionScores.summary}/100` : ""}

Return this exact JSON structure:
{
  "profileScore": <number 0-100, overall resume quality>,
  "contentScore": <number 0-100, quality of written content>,
  "skillScore": <number 0-100, relevance and depth of skills>,
  "experienceScore": <number 0-100, quality of experience descriptions>,
  "atsScore": <number 0-100, ATS compatibility${ats ? ` — use ${ats.score} as baseline` : ""}>,
  "tips": [<5 specific, actionable improvement tips>]
}

SCORING RULES:
- All scores must be between 0 and 100
- profileScore is a weighted average: content(30%) + skills(25%) + experience(30%) + ats(15%)
- Be consistent — same resume should always score within 5 points
- Tips must be specific to this resume, never generic`;

  return runAI<ResumeScoreResult>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.1,
    userId,
    ttlHours: 6,
    skipCache: !!userId, // Always fresh score for authenticated users
  });
}