export type JobIntelligence = {
  roleCategory: string;
  requiredLevel: string;
  difficulty: string;
  domain: string;
  importantSkills: string[];
  secondarySkills: string[];
};

export type JobMatchResult = {
  matchScore: number;
  fitLevel: string;
  shouldApply: boolean;
  reason: string;
  missingSkills: string[];
  improvementHint: string;
};

export type ResumeIntelligence = {
  profileScore: number;
  atsScore: number;
  clarityScore: number;
  impactScore: number;
  experienceScore: number;
  careerLevel: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  improvementTips: string[];
  recommendedRoles: string[];
  summaryFeedback: string;
};

export type SkillGapResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  jobFrequencyMap: Record<string, number>;
};

export type GeneratedGap = {
  skill: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedTime: string;
  reasoning: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  learningLink?: string;
};

export type InterviewPrepResult = {
  questions: string[];
  technicalTopics: string[];
  starDrafts: string[];
  difficulty: string;
  category: string;
};

export type CareerAdvice = {
  careerLevel: string;
  bestRoles: string[];
  missingSkills: string[];
  salaryRange: string;
  advice: string[];
};

export type JobScoreResult = {
  score: number;
  difficulty: string;
  growthPotential: string;
  salaryLevel: string;
  competitionLevel: string;
  summary: string;
};