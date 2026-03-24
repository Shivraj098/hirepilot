import { aiJsonCompletion } from "@/server/ai/core/client";
import { InterviewPrepResult } from "@/server/types/ai.types";
import { logError } from "@/server/utils/logger";

const SYSTEM_PROMPT = `You are an expert technical interview coach with experience 
preparing candidates for interviews at top tech companies.

You create realistic, role-specific interview preparation materials that give 
candidates a genuine competitive advantage.
You always respond with valid JSON only.`;

export async function generateInterviewPrep(
  jobTitle: string,
  jobDescription: string,
  resumeSkills: string[]
): Promise<InterviewPrepResult> {
  const userPrompt = `Create comprehensive interview preparation for this role.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

CANDIDATE SKILLS: ${resumeSkills.slice(0, 20).join(", ")}

Return this exact JSON structure:
{
  "questions": [<10-12 likely interview questions specific to this role and description>],
  "technicalTopics": [<8-10 technical topics to study based on the job requirements>],
  "starDrafts": [<3 STAR method answer templates for behavioral questions common to this role>],
  "difficulty": <"Easy" | "Medium" | "Hard" based on role seniority>,
  "category": <"Technical" | "HR" | "Mixed">
}

RULES FOR QUESTIONS:
- Mix technical, behavioral, and situational questions
- Make questions specific to the job description — not generic
- Include at least 3 role-specific technical questions
- Include 2-3 system design questions if Senior+ role

RULES FOR STAR DRAFTS:
- Each STAR draft should be a template the candidate can fill in
- Format: "Situation: [describe context], Task: [your responsibility], Action: [what you did], Result: [measurable outcome]"
- Make them relevant to skills the candidate already has`;

  try {
    const result = await aiJsonCompletion<InterviewPrepResult>(
      SYSTEM_PROMPT,
      userPrompt,
      { temperature: 0.3 }
    );

    if (result) return result;
  } catch (err) {
    logError("Interview prep AI failed", err);
  }

  // Fallback
  return {
    questions: [
      `Tell me about your experience with ${resumeSkills[0] ?? "your primary technology"}.`,
      "Describe a challenging project you worked on and how you overcame obstacles.",
      "How do you approach debugging a complex issue in production?",
      `What's your experience with the tech stack required for ${jobTitle}?`,
      "Tell me about a time you had to learn a new technology quickly.",
    ],
    technicalTopics: resumeSkills.slice(0, 8),
    starDrafts: [
      "Situation: [Describe a relevant challenge], Task: [Your responsibility], Action: [Steps you took], Result: [Measurable outcome]",
    ],
    difficulty: "Medium",
    category: "Mixed",
  };
}