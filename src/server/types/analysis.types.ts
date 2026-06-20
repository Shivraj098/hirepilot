export type ImprovementImpact =
  | "LOW"
  | "MEDIUM"
  | "HIGH";


export type ImprovementCategory =
  | "ATS"
  | "Keywords"
  | "Impact"
  | "Formatting"
  | "Skills"
  | "Content";

/*
interface ATSAnalysisDTO {
  score: number;

  matchedKeywords: string[];

  missingKeywords: string[];

  weakKeywords: string[];
}

interface ResumeScoringDTO {
  profileScore: number;

  atsScore: number;

  contentScore: number;

  clarityScore: number;

  experienceScore: number;

  skillsScore: number;
}

interface ResumeIntelligenceDTO {
  strengths: string[];

  weaknesses: string[];

  improvements: ResumeImprovement[];

  summary: string;
}

*/



export interface ResumeAnalysisResult {
  success: boolean;

  scores: ResumeScores;

  keywords: KeywordAnalysis;

  insights: ResumeInsights;

  analysisEngineVersion: string;
}

export interface KeywordAnalysis {
  score : number;


  matched: string[];

  missing: string[];

  weak: string[];
}

export interface ResumeScores {
  profile: number;

  ats: number;

  content: number;

  clarity: number;

  experience: number;

  skills: number;
}

export interface Recommendation {
  category: ImprovementCategory;

  issue: string;

  fix: string;

  impact: ImprovementImpact;
}

export interface ResumeInsights {
  strengths: string[];

  weaknesses: string[];

  recommendations: Recommendation[];

  summary: string;

}