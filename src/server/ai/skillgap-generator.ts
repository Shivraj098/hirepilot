type SkillGapResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
};

type GeneratedGap = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  reasoning: string;
};

export function generateSkillGaps(
  jobDescription: string,
  skillGap: SkillGapResult
): GeneratedGap[] {
  return skillGap.missingSkills.map((skill) => ({
    skill,
    priority: "HIGH",
    estimatedTime: "1-2 weeks",
    reasoning: `The job description requires ${skill}, but it is missing from the resume.`,
  }));
}