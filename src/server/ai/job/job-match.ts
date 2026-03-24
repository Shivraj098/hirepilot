import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { JobMatchResult } from "@/server/types/ai.types";

const SYSTEM_PROMPT = `You are a senior technical recruiter who specializes in 
evaluating candidate-job fit. You give honest, data-driven assessments.

Your match scores are calibrated: 
- 80-100: Strong/Perfect fit, should definitely apply
- 60-79: Good fit, worth applying with minor improvements
- 40-59: Average fit, needs preparation before applying
- Below 40: Poor fit, significant skill gaps
You always respond with valid JSON only.`;

export async function analyzeJobMatch(
  resumeContent: unknown,
  jobDescription: string,
  userId?: string
): Promise<JobMatchResult | null> {
  const ats = calculateATS(resumeContent, jobDescription);

  const userPrompt = `Evaluate how well this candidate fits the job description.

ATS ANALYSIS:
- Overall Match: ${ats.score}%
- Matched Skills: ${ats.matchedKeywords.slice(0, 15).join(", ")}
- Missing Skills: ${ats.missingKeywords.slice(0, 15).join(", ")}

RESUME:
${JSON.stringify(resumeContent, null, 2)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return this exact JSON structure:
{
  "matchScore": <number 0-100 — weighted: skills(40%) + experience(35%) + education(15%) + other(10%)>,
  "fitLevel": <"Poor" | "Average" | "Good" | "Strong" | "Perfect">,
  "shouldApply": <true if matchScore >= 55, false otherwise>,
  "reason": <2-3 sentences explaining the match score honestly>,
  "missingSkills": [<specific skills from the job that the resume lacks>],
  "improvementHint": <1-2 specific actions to improve match before applying>,
  "strengths": [<2-3 specific strengths this candidate has for this role>]
}

CALIBRATION:
- Use ATS score (${ats.score}%) as a baseline but adjust based on experience quality
- matchScore and fitLevel must be consistent with each other
- shouldApply is true only if matchScore >= 55`;

  return runAI<JobMatchResult>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    userId,
    ttlHours: 12,
  });
}
