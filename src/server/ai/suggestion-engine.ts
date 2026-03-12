import { Prisma } from "@prisma/client";
import { aiJsonCompletion } from "./client";
import { parseResumeContent } from "./utils/resume-parser";

type ExperienceItem = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type EducationItem = {
  institution: string;
  degree: string;
  duration: string;
};

export type StructuredResumeContent = {
  summary?: string;
  experience?: ExperienceItem[];
  skills?: string[];
  education?: EducationItem[];
};

export type SkillGapResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

type SectionSuggestion = {
  section: keyof StructuredResumeContent;
  originalContent: Prisma.InputJsonValue;
  suggestedContent: Prisma.InputJsonValue;
};

/*
====================================
Rule-based suggestions (safe fallback)
====================================
*/

function generateRuleSuggestions(
  resumeContent: StructuredResumeContent,
  skillGap: SkillGapResult
): SectionSuggestion[] {
  const suggestions: SectionSuggestion[] = [];

  if (resumeContent.summary) {
    suggestions.push({
      section: "summary",
      originalContent: resumeContent.summary,
      suggestedContent: `${resumeContent.summary}

Optimized to better align with job-required skills.`,
    });
  }

  if (skillGap.missingSkills.length > 0) {
    const existingSkills = resumeContent.skills ?? [];

    suggestions.push({
      section: "skills",
      originalContent: existingSkills,
      suggestedContent: [
        ...existingSkills,
        ...skillGap.missingSkills.filter(
          (s) => !existingSkills.includes(s)
        ),
      ],
    });
  }

  return suggestions;
}

/*
====================================
AI suggestions
====================================
*/

async function generateAISuggestions(
  resumeContent: StructuredResumeContent,
  jobDescription: string
): Promise<SectionSuggestion[] | null> {
  const parsed = parseResumeContent(resumeContent);

  const prompt = `
You are an AI resume reviewer.

Suggest improvements to this resume to better match the job.

Return JSON array of suggestions.

Format:
[
  {
    "section": "summary | skills | experience | education",
    "suggestedContent": any
  }
]

Resume:
${JSON.stringify(parsed, null, 2)}

Job:
${jobDescription}
`;

  const result = await aiJsonCompletion<
    {
      section: keyof StructuredResumeContent;
      suggestedContent: Prisma.InputJsonValue;
    }[]
  >(prompt);

  if (!result) return null;

  return result.map((s) => ({
    section: s.section,
    originalContent:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resumeContent as any)[s.section] ?? null,
    suggestedContent: s.suggestedContent,
  }));
}

/*
====================================
Main generator
====================================
*/

export async function generateSectionSuggestions(
  resumeContent: StructuredResumeContent,
  skillGap: SkillGapResult,
  jobDescription: string
): Promise<SectionSuggestion[]> {
  // try AI first
  const ai = await generateAISuggestions(
    resumeContent,
    jobDescription
  );

  if (ai && ai.length > 0) {
    return ai;
  }

  // fallback
  return generateRuleSuggestions(
    resumeContent,
    skillGap
  );
}