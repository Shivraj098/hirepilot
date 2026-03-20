import { extractResumeSkills, extractJobKeywords } from "@/server/ai/resume/extractors";
import { calculateATS } from "@/server/ai/resume/ats-engine";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

function uniqueArray(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function isPartialMatch(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

export function calculateSkillGap(
  resumeContent: unknown,
  jobDescription: string,
) {
  const rawResumeSkills = extractResumeSkills(resumeContent);
  const rawJobSkills = extractJobKeywords(jobDescription);

  const resumeSkills = uniqueArray(
    rawResumeSkills.map((s) => normalize(s))
  );

  const jobSkillsNormalized = rawJobSkills.map((s) =>
    normalize(s)
  );

  const jobFrequencyMap: Record<string, number> = {};

  for (const skill of jobSkillsNormalized) {
    jobFrequencyMap[skill] =
      (jobFrequencyMap[skill] || 0) + 1;
  }

  const uniqueJobSkills = uniqueArray(
    jobSkillsNormalized
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // ✅ match logic
  for (const jobSkill of uniqueJobSkills) {
    const matched = resumeSkills.some(
      (resumeSkill) =>
        isPartialMatch(resumeSkill, jobSkill)
    );

    if (matched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }

  // ✅ ATS engine used for score
  const ats = calculateATS(
    resumeContent,
    jobDescription,
  );

  return {
  matchedSkills,
  missingSkills,
  matchPercentage: ats.score,
  jobFrequencyMap,

  roadmap: missingSkills.map(skill => ({
    skill,
    priority:
      jobFrequencyMap[skill] >= 2
        ? "HIGH"
        : "MEDIUM",

    estimatedTime:
      jobFrequencyMap[skill] >= 2
        ? "2-4 weeks"
        : "1-2 weeks",
  })),
};
}