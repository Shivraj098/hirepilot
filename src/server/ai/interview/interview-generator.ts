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

  matchedSkills: string[],

  missingSkills: string[],

  matchPercentage: number,
): Promise<InterviewPrepResult> {
  const userPrompt = `Create comprehensive interview preparation for this role.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

MATCH SCORE:
${matchPercentage}/100

MATCHED SKILLS:
${matchedSkills.slice(0, 15).join(", ")}

MISSING SKILLS:
${missingSkills.slice(0, 10).join(", ")}

Return this exact JSON structure:
{
  "questions": [<10-12 likely interview questions specific to this role and description>],
  "technicalTopics": [<8-10 technical topics to study based on the job requirements>],
  "starDrafts": [<3 STAR method answer templates for behavioral questions common to this role>],
  "focusAreas": [<3-5 key focus areas for this role>],
  "difficulty": <"Easy" | "Medium" | "Hard" based on role seniority>,
  "category": <"Technical" | "HR" | "Mixed">
}

- Technical topics and focus areas should emphasize the candidate's missing skills before already-mastered skills.

RULES FOR QUESTIONS:
- Mix technical, behavioral, and situational questions
- Make questions specific to the job description — not generic
- Include at least 3 role-specific technical questions
-If the match score is above 80 or the role description indicates Senior/Lead responsibilities, include 2-3 system design questions.
RULES FOR STAR DRAFTS:
- Each STAR draft should be a template the candidate can fill in
- Format: "Situation: [describe context], Task: [your responsibility], Action: [what you did], Result: [measurable outcome]"
- Make them relevant to skills the candidate already has`;

  try {
    const result = await aiJsonCompletion<InterviewPrepResult>(
      SYSTEM_PROMPT,
      userPrompt,
      { temperature: 0.25 },
    );

    if (result) return result;
  } catch (err) {
    logError("Interview prep AI failed", err);
  }

  // Fallback
  return {
    questions: [
      `Tell me about your experience with ${
        matchedSkills[0] ?? "your primary technology"
      }.",
      "Describe a challenging project you worked on and how you overcame obstacles.",
      "How do you approach debugging a complex issue in production?",
      What's your experience with the tech stack required for ${jobTitle}?,
      "Tell me about a time you had to learn a new technology quickly."`,
    ],
    technicalTopics: [...missingSkills, ...matchedSkills].slice(0, 8),

    focusAreas: missingSkills.slice(0, 5),
    starDrafts: [
      "Situation: [Describe a relevant challenge], Task: [Your responsibility], Action: [Steps you took], Result: [Measurable outcome]",
    ],
    difficulty: "Medium",
    category: "Mixed",
  };
}
