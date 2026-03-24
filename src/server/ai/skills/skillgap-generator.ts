import { aiJsonCompletion } from "@/server/ai/core/client";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { GeneratedGap, SkillGapResult } from "@/server/types/ai.types";
import { logError } from "@/server/utils/logger";

const SYSTEM_PROMPT = `You are an expert career coach and technical skills advisor 
with deep knowledge of the tech industry learning landscape.

You create realistic, actionable learning roadmaps with accurate time estimates.
You always respond with valid JSON only.`;

// ==============================
// AI SKILL GAP GENERATION
// ==============================

async function generateSkillGapsAI(
  jobDescription: string,
  skillGap: SkillGapResult
): Promise<GeneratedGap[] | null> {
  if (skillGap.missingSkills.length === 0) return [];

  const topMissing = skillGap.missingSkills
    .sort(
      (a, b) =>
        (skillGap.jobFrequencyMap[b] ?? 0) -
        (skillGap.jobFrequencyMap[a] ?? 0)
    )
    .slice(0, 10);

  const userPrompt = `Create a prioritized learning roadmap for these missing skills.

JOB CONTEXT:
${jobDescription.slice(0, 1000)}

MISSING SKILLS (ordered by job frequency):
${topMissing.map((s) => `- ${s} (mentioned ${skillGap.jobFrequencyMap[s] ?? 1}x)`).join("\n")}

ALREADY MATCHED SKILLS:
${skillGap.matchedSkills.slice(0, 10).join(", ")}

Return a JSON array of learning roadmap items:
[
  {
    "skill": <exact skill name>,
    "priority": <"HIGH" if mentioned 2+ times or critical, "MEDIUM" if mentioned once, "LOW" if nice-to-have>,
    "estimatedTime": <realistic learning time e.g. "2-3 weeks", "1-2 months">,
    "difficulty": <"EASY" | "MEDIUM" | "HARD" based on complexity>,
    "reasoning": <1 sentence: why this skill matters for this specific role>,
    "learningLink": <a real, specific learning resource URL — use official docs or well-known platforms>
  }
]

RULES:
- estimatedTime must be realistic — React takes months to master, not days
- HIGH priority for skills mentioned 2+ times or that are core to the role
- learningLink must be a real URL (official docs, Coursera, freeCodeCamp, MDN, etc.)
- Order items by priority then by estimated learning time (shortest first)`;

  return aiJsonCompletion<GeneratedGap[]>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.2,
  });
}

// ==============================
// RULE-BASED FALLBACK
// ==============================

function fallbackSkillGaps(skillGap: SkillGapResult): GeneratedGap[] {
  return skillGap.missingSkills
    .sort(
      (a, b) =>
        (skillGap.jobFrequencyMap[b] ?? 0) -
        (skillGap.jobFrequencyMap[a] ?? 0)
    )
    .slice(0, 8)
    .map((skill) => {
      const frequency = skillGap.jobFrequencyMap[skill] ?? 1;
      return {
        skill,
        priority: frequency >= 2 ? "HIGH" : "MEDIUM",
        estimatedTime: frequency >= 2 ? "2-4 weeks" : "1-2 weeks",
        reasoning: `${skill} is required by this role${frequency >= 2 ? " and mentioned multiple times" : ""}.`,
        difficulty: "MEDIUM" as const,
        learningLink: "",
      };
    });
}

// ==============================
// MAIN EXPORT
// ==============================

export async function generateSkillGaps(
  jobDescription: string,
  skillGap: SkillGapResult
): Promise<GeneratedGap[]> {
  try {
    const ai = await generateSkillGapsAI(jobDescription, skillGap);
    if (ai && Array.isArray(ai) && ai.length > 0) return ai;
  } catch (err) {
    logError("Skill gap AI failed", err);
  }

  return fallbackSkillGaps(skillGap);
}