export type ResumeScoreResult = {
  profileScore: number;
  contentScore: number;
  skillScore: number;
  experienceScore: number;
  atsScore: number;
  tips: string[];
};

export type ATSSectionScores = {
  skills: number;

  experience: number;

  summary: number;
};

export type ATSResult = {
  score: number;

  matchedKeywords: string[];

  missingKeywords: string[];

  weakKeywords: string[];

  sectionScores: ATSSectionScores;
};