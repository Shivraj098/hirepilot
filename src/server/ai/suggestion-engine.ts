import { Prisma } from "@prisma/client";
import { aiJsonCompletion } from "./client";
import { parseResumeContent } from "./utils/resume-parser";
import { calculateATS } from "./ats-engine";

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
Rule fallback
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

Optimized to match job-required skills.`,
    });
  }

  if (skillGap.missingSkills.length > 0) {
    const existing = resumeContent.skills ?? [];

    suggestions.push({
      section: "skills",
      originalContent: existing,
      suggestedContent: [
        ...existing,
        ...skillGap.missingSkills.filter(
          (s) => !existing.includes(s)
        ),
      ],
    });
  }

  return suggestions;
}

/*
====================================
AI Suggestions (Phase-2)
====================================
*/

async function generateAISuggestions(
  resumeContent: StructuredResumeContent,
  jobDescription: string
): Promise<SectionSuggestion[] | null> {
  const parsed = parseResumeContent(
    resumeContent
  );

  const ats = calculateATS(
    parsed,
    jobDescription
  );

  const prompt = `
You are an expert resume reviewer AI.

Suggest improvements.

Return JSON array.

Format:

[
  {
    "section": "summary | skills | experience | education",
    "suggestedContent": any,
    "priority": "HIGH | MEDIUM | LOW",
    "impactScore": number,
    "type": "rewrite | add | reorder | improve"
  }
]

Rules:

- Improve ATS score
- Use missing keywords
- Improve wording
- Improve skills order
- Improve experience bullets
- Improve summary

ATS score:
${ats.score}

Missing:
${ats.missingKeywords.join(", ")}

Resume:
${JSON.stringify(parsed, null, 2)}

Job:
${jobDescription}
`;

  try {
    const result =
      await aiJsonCompletion<
        {
          section: keyof StructuredResumeContent;
          suggestedContent: Prisma.InputJsonValue;
          priority: string;
          impactScore: number;
          type: string;
        }[]
      >(prompt, {
        temperature: 0.2,
      });

    if (!result) return null;

    const validSections = [
      "summary",
      "skills",
      "experience",
      "education",
    ];

    return result
      .filter((s) =>
        validSections.includes(
          s.section as string
        )
      )
      .map((s) => ({
        section: s.section,
        originalContent:
          resumeContent[
            s.section
          ] === null || resumeContent[s.section] === undefined,
        suggestedContent:
          s.suggestedContent,
      }));
  } catch (err) {
    console.error(
      "AI suggestion error",
      err
    );

    return null;
  }
}
/*
====================================
Main
====================================
*/

export async function generateSectionSuggestions(
  resumeContent: StructuredResumeContent,
  skillGap: SkillGapResult,
  jobDescription: string
): Promise<SectionSuggestion[]> {

  const ai = await generateAISuggestions(
    resumeContent,
    jobDescription
  );

  if (ai && ai.length > 0) {
    return ai;
  }

  // fallback uses skillGap
  return generateRuleSuggestions(
    resumeContent,
    skillGap
  );
}