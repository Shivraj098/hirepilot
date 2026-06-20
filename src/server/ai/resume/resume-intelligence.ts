import { runAI } from "@/server/ai/core/orchestrator";
import { ResumeIntelligence } from "@/server/types/ai.types";
import { ATSResult, ResumeScoreResult } from "@/server/types/score.types";

const SYSTEM_PROMPT = `You are a senior technical recruiter and career coach with 15 years 
of experience reviewing resumes for top tech companies including Google, Meta, and Amazon.

You provide honest, actionable, and specific feedback. You never give generic advice.
You always respond with valid JSON only — no explanations outside the JSON.`;

export async function analyzeResumeProfile(
  resumeContent: unknown,
  scoring:ResumeScoreResult,
  ats:ATSResult,
  userId?: string,
): Promise<ResumeIntelligence | null> {
  const userPrompt = `A deterministic resume analysis engine has already
evaluated this resume.

DETERMINISTIC SCORES

Overall Score:
${scoring.profileScore}/100

ATS Score:
${scoring.atsScore}/100

Content Score:
${scoring.contentScore}/100

Skill Score:
${scoring.skillScore}/100

Experience Score:
${scoring.experienceScore}/100

ATS ANALYSIS

Skills:
${ats.sectionScores.skills}

Experience:
${ats.sectionScores.experience}

Summary:
${ats.sectionScores.summary}

Matched Keywords:
${ats.matchedKeywords.join(", ")}

Missing Keywords:
${ats.missingKeywords.join(", ")}

Weak Keywords:
${ats.weakKeywords.join(", ")}

RESUME

${JSON.stringify(
  resumeContent,
  null,
  2,
)}
Return this exact JSON structure:
{
  
  "careerLevel": <"Junior" | "Mid" | "Senior" | "Lead" | "Executive">,
  "strengths": [<3-5 specific strengths, each a complete sentence>],
  "weaknesses": [<3-5 specific weaknesses with actionable fixes>],
  "missingSkills": [<skills commonly expected at this level that are absent>],
  "recommendedRoles": [<5 job titles this resume is best suited for>],
  "summaryFeedback": <2-3 sentence specific feedback on the summary section>
}
`;

  return runAI<ResumeIntelligence>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
    userId,
    ttlHours: 12,
  });
}
