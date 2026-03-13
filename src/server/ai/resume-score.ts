import { aiJsonCompletion } from "./client";
import { calculateATS } from "./ats-engine";

export type ResumeScoreResult = {
  profileScore: number;

  contentScore: number;

  skillScore: number;

  experienceScore: number;

  atsScore: number;

  tips: string[];
};

export async function calculateResumeScore(
  resumeContent: unknown,
  jobDescription?: string
): Promise<ResumeScoreResult | null> {

  const ats = jobDescription
    ? calculateATS(
        resumeContent,
        jobDescription
      )
    : null;

  const prompt = `
You are an AI resume reviewer.

Score this resume.

Return JSON.

Format:

{
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

  const result =
    await aiJsonCompletion<ResumeScoreResult>(
      prompt,
      { temperature: 0.2 }
    );

  return result;
}