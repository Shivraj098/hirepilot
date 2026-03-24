import { runAI } from "@/server/ai/core/orchestrator";
import { ResumeIntelligence } from "@/server/types/ai.types";

const SYSTEM_PROMPT = `You are a senior technical recruiter and career coach with 15 years 
of experience reviewing resumes for top tech companies including Google, Meta, and Amazon.

You provide honest, actionable, and specific feedback. You never give generic advice.
You always respond with valid JSON only — no explanations outside the JSON.`;

export async function analyzeResumeProfile(
  resumeContent: unknown,
  userId?: string
): Promise<ResumeIntelligence | null> {
  const userPrompt = `Analyze this resume deeply and return a comprehensive assessment.

RESUME:
${JSON.stringify(resumeContent, null, 2)}

Return this exact JSON structure:
{
  "profileScore": <number 0-100, overall resume quality>,
  "atsScore": <number 0-100, ATS compatibility>,
  "clarityScore": <number 0-100, clarity and readability>,
  "impactScore": <number 0-100, measurable impact and achievements>,
  "experienceScore": <number 0-100, experience quality and relevance>,
  "careerLevel": <"Junior" | "Mid" | "Senior" | "Lead" | "Executive">,
  "strengths": [<3-5 specific strengths, each a complete sentence>],
  "weaknesses": [<3-5 specific weaknesses with actionable fixes>],
  "missingSkills": [<skills commonly expected at this level that are absent>],
  "improvementTips": [<5 specific, actionable tips to improve this resume>],
  "recommendedRoles": [<5 job titles this resume is best suited for>],
  "summaryFeedback": <2-3 sentence specific feedback on the summary section>
}

SCORING RULES:
- profileScore below 60 means the resume needs significant work
- Be strict and realistic — most resumes score 50-75
- Only award 85+ for truly exceptional resumes
- Base all scores strictly on the resume content provided`;

  return runAI<ResumeIntelligence>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    userId,
    ttlHours: 12,
  });
}