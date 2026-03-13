import { aiJsonCompletion } from "./client";

export type ResumeIntelligence = {
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
You are an AI career coach.

Analyze this resume.

Return JSON only.

Format:

{
  "profileScore": number,
  "careerLevel": string,
  "experienceLevel": string,
  "resumeQuality": string,
  "strengths": string[],
  "weaknesses": string[],
  "preferredRoles": string[],
  "recommendedSkills": string[],
  "topDomains": string[],
  "jobFitHint": string
}

Rules:

- profileScore = 0-100
- careerLevel = Beginner | Junior | Mid | Senior
- experienceLevel = Low | Medium | High
- resumeQuality = Poor | Average | Good | Strong

Resume:
${JSON.stringify(resumeContent, null, 2)}
`;

  const result =
    await aiJsonCompletion<ResumeIntelligence>(
      prompt,
      {
        temperature: 0.2,
      }
    );

  return result;
}