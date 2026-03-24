import { runAI } from "@/server/ai/core/orchestrator";
import { calculateATS } from "./ats-engine";
import { parseResumeContent } from "@/server/utils/resume-parser";
import { ResumeContent } from "@/server/types/resume.types";
import { SkillGapResult } from "@/server/types/ai.types";
import { Prisma } from "@prisma/client";

export type SectionSuggestion = {
  section: keyof ResumeContent;
  originalContent: Prisma.InputJsonValue;
  suggestedContent: Prisma.InputJsonValue;
  priority: "HIGH" | "MEDIUM" | "LOW";
  impactScore: number;
  type: "rewrite" | "add" | "reorder" | "improve";
  reasoning: string;
};

const SYSTEM_PROMPT = `You are a senior ATS optimization expert and professional resume writer 
with experience helping candidates land roles at top tech companies.

You provide specific, actionable resume improvements that measurably increase ATS scores 
and recruiter appeal. You never fabricate experience or skills the candidate doesn't have.
You always respond with valid JSON only.`;

// ==============================
// AI SUGGESTIONS
// ==============================

async function generateAISuggestions(
  resumeContent: ResumeContent,
  jobDescription: string,
  atsData: ReturnType<typeof calculateATS>
): Promise<SectionSuggestion[] | null> {
  const parsed = parseResumeContent(resumeContent);

  const userPrompt = `Generate targeted resume improvements to increase ATS score and recruiter appeal.

CURRENT ATS SCORE: ${atsData.score}/100
MATCHED KEYWORDS: ${atsData.matchedKeywords.slice(0, 15).join(", ")}
MISSING KEYWORDS: ${atsData.missingKeywords.slice(0, 15).join(", ")}
WEAK KEYWORDS (present but not in skills): ${atsData.weakKeywords.slice(0, 10).join(", ")}

CURRENT RESUME:
${JSON.stringify(parsed, null, 2)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return a JSON array of 3-5 suggestions (no more):
[
  {
    "section": <"summary" | "skills" | "experience" | "education">,
    "suggestedContent": <the improved content for this section — must match section type exactly>,
    "priority": <"HIGH" | "MEDIUM" | "LOW">,
    "impactScore": <number 1-100 — how much this improves ATS and recruiter appeal>,
    "type": <"rewrite" | "add" | "reorder" | "improve">,
    "reasoning": <1-2 sentences explaining exactly why this change helps>
  }
]

STRICT RULES:
- Never fabricate skills or experience the candidate does not have
- Only suggest adding skills that appear in the job description AND are plausible given their experience
- impactScore above 70 only for changes that directly address missing high-frequency keywords
- Prioritize skills section improvements as they have highest ATS impact
- suggestedContent for "skills" must be an array of strings
- suggestedContent for "summary" must be a string
- suggestedContent for "experience" must be an array of experience objects`;

  const result = await runAI
    {
      section: keyof ResumeContent;
      suggestedContent: Prisma.InputJsonValue;
      priority: "HIGH" | "MEDIUM" | "LOW";
      impactScore: number;
      type: "rewrite" | "add" | "reorder" | "improve";
      reasoning: string;
    }[]
  >(SYSTEM_PROMPT, userPrompt, { temperature: 0.2 });

  if (!result || !Array.isArray(result)) return null;

  const validSections = ["summary", "skills", "experience", "education"];

  return result
    .filter((s) => validSections.includes(s.section as string))
    .slice(0, 5)
    .map((s) => ({
      section: s.section,
      originalContent: (resumeContent[s.section] ?? null) as Prisma.InputJsonValue,
      suggestedContent: s.suggestedContent,
      priority: s.priority ?? "MEDIUM",
      impactScore: Math.min(100, Math.max(0, s.impactScore ?? 50)),
      type: s.type ?? "improve",
      reasoning: s.reasoning ?? "",
    }));
}

// ==============================
// RULE-BASED FALLBACK
// ==============================

function generateRuleSuggestions(
  resumeContent: ResumeContent,
  skillGap: SkillGapResult
): SectionSuggestion[] {
  const suggestions: SectionSuggestion[] = [];

  if (skillGap.missingSkills.length > 0) {
    const existing = resumeContent.skills ?? [];
    const highPriorityMissing = skillGap.missingSkills
      .filter((s) => (skillGap.jobFrequencyMap[s] ?? 0) >= 2)
      .slice(0, 5);

    if (highPriorityMissing.length > 0) {
      suggestions.push({
        section: "skills",
        originalContent: existing as Prisma.InputJsonValue,
        suggestedContent: [
          ...existing,
          ...highPriorityMissing,
        ] as Prisma.InputJsonValue,
        priority: "HIGH",
        impactScore: 65,
        type: "add",
        reasoning: `Adding ${highPriorityMissing.join(", ")} will directly address the most frequently mentioned missing keywords in the job description.`,
      });
    }
  }

  if (resumeContent.summary && resumeContent.summary.length < 150) {
    suggestions.push({
      section: "summary",
      originalContent: resumeContent.summary as Prisma.InputJsonValue,
      suggestedContent: resumeContent.summary as Prisma.InputJsonValue,
      priority: "MEDIUM",
      impactScore: 40,
      type: "improve",
      reasoning: "Your summary is too brief. Expanding it with role-specific keywords will improve both ATS score and recruiter engagement.",
    });
  }

  return suggestions;
}

// ==============================
// MAIN EXPORT
// ==============================

export async function generateSectionSuggestions(
  resumeContent: ResumeContent,
  skillGap: SkillGapResult,
  jobDescription: string
): Promise<SectionSuggestion[]> {
  const atsData = calculateATS(resumeContent, jobDescription);

  const ai = await generateAISuggestions(
    resumeContent,
    jobDescription,
    atsData
  );

  if (ai && ai.length > 0) return ai;

  return generateRuleSuggestions(resumeContent, skillGap);
}