import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { JobMatchResult } from "@/server/types/ai.types";
import { buildJobContext } from "./job-context";

const SYSTEM_PROMPT = `You are a senior technical recruiter who specializes in 
evaluating candidate-job fit. You give honest, data-driven assessments.


You always respond with valid JSON only.`;
export type JobFitLevel = "Poor" | "Average" | "Good" | "Strong" | "Perfect";

type JobMatchAIResponse = {
  reason: string;

  missingSkills: string[];

  improvementHint: string;

  strengths: string[];
};
function calculateFitLevel(score: number): JobFitLevel {
  if (score >= 85) {
    return "Perfect";
  }

  if (score >= 70) {
    return "Strong";
  }

  if (score >= 55) {
    return "Good";
  }

  if (score >= 40) {
    return "Average";
  }

  return "Poor";
}

export async function analyzeJobMatch(
  resumeContent: unknown,
  jobDescription: string,
  userId?: string,
): Promise<JobMatchResult | null> {
 
  const context =
  buildJobContext(
    jobDescription,
  );
  const ats =
  calculateATS(
    resumeContent,
    {
      jobDescription:
        context.rawDescription,
    },
  );

  const matchScore = ats.score;

  const fitLevel = calculateFitLevel(matchScore);

  const shouldApply = matchScore >= 55;

  const userPrompt = `Evaluate how well this candidate fits the job description.

ATS ANALYSIS:
- Matched Skills: ${ats.matchedKeywords.slice(0, 15).join(", ")}
- Missing Skills: ${ats.missingKeywords.slice(0, 15).join(", ")}
- Deterministic Match Score: ${matchScore}
- Fit Level: ${fitLevel}

RESUME:
${JSON.stringify(resumeContent, null, 2)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return this exact JSON structure:
{
  
  "reason": <2-3 sentences explaining the match score honestly>,
  "missingSkills": [<specific skills from the job that the resume lacks>],
  "improvementHint": <1-2 specific actions to improve match before applying>,
  "strengths": [<2-3 specific strengths this candidate has for this role>]
}`;

  const intelligence = await runAI<JobMatchAIResponse>(
    SYSTEM_PROMPT,
    userPrompt,
    {
      temperature: 0.2,
      userId,
      ttlHours: 12,
    },
  );

  return {
    evaluation: {
      matchScore,
      fitLevel,
      shouldApply,
    },

    intelligence: {
      reason: intelligence?.reason ?? "",

      missingSkills: intelligence?.missingSkills ?? [],

      improvementHint: intelligence?.improvementHint ?? "",

      strengths: intelligence?.strengths ?? [],
    },
  };
}
