import { extractResumeSkills } from "@/server/ai/resume/extractors";
import { calculateATS } from "@/server/ai/resume/ats-engine";
import { SkillGapResult } from "@/server/types/ai.types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function isMatch(resumeSkill: string, jobSkill: string): boolean {
  const a = normalize(resumeSkill);
  const b = normalize(jobSkill);
  // Exact match or one contains the other (but only if difference is small)
  if (a === b) return true;
  if (a.length > 3 && b.length > 3) {
    if (a.includes(b) && b.length / a.length > 0.6) return true;
    if (b.includes(a) && a.length / b.length > 0.6) return true;
  }
  return false;
}

export function calculateSkillGap(
  resumeContent: unknown,
  jobDescription: string
): SkillGapResult {
  const resumeSkills = uniqueArray(
    extractResumeSkills(resumeContent).map(normalize)
  );

  // Use ATS engine for consistent keyword extraction
  const ats = calculateATS(resumeContent, jobDescription);

  const jobFrequencyMap: Record<string, number> = {};
  for (const kw of ats.matchedKeywords.concat(ats.missingKeywords)) {
    jobFrequencyMap[kw] = (jobFrequencyMap[kw] ?? 0) + 1;
  }

  const uniqueJobSkills = uniqueArray([
    ...ats.matchedKeywords,
    ...ats.missingKeywords,
  ]);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jobSkill of uniqueJobSkills) {
    const matched = resumeSkills.some((rs) => isMatch(rs, jobSkill));
    if (matched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }

  return {
    matchedSkills,
    missingSkills,
    matchPercentage: ats.score,
    jobFrequencyMap,
  };
}
