import { runAI } from "@/server/ai/core/orchestrator";

 type ResumeIntelligence = {
  profileScore: number;

  careerLevel: string;

  experienceLevel: string;

  resumeQuality: string;

  strengths: string[];

  weaknesses: string[];

  preferredRoles: string[];

  recommendedSkills: string[];

  topDomains: string[];

  jobFitHint: string;
};

export async function analyzeResumeProfile(
  resumeContent: unknown
): Promise<ResumeIntelligence | null> {
  const prompt = `
You are a senior recruiter, ATS reviewer, and career coach.

Analyze resume deeply.

Return JSON:

{
 profileScore: number,
 atsScore: number,
 clarityScore: number,
 impactScore: number,
 experienceScore: number,

 strengths: string[],
 weaknesses: string[],
 missingSkills: string[],
 improvementTips: string[],
 recommendedRoles: string[],
 careerLevel: string,
 summaryFeedback: string
}

Rules:

- Score 0-100
- Be strict
- Use resume content only

Resume:
${JSON.stringify(resumeContent)}
`;

  const result =
    await runAI<ResumeIntelligence>(
      prompt,
      {
        temperature: 0.2,
      }
    );

  return result;
}