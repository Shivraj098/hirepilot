export interface ExtractedJob {
  title: string;
  company?: string;
  description: string;
  skills: string[];
  location?: string;
}

export type JobExtractResult =
  ExtractedJob;