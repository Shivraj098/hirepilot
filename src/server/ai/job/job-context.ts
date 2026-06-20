import { extractJobKeywords } from "../resume/extractors";

export type JobContext = {
  rawDescription: string;

  normalizedDescription: string;

  keywords: string[];
  frequencyMap:Record<string,number>
};

export function buildJobContext(
  jobDescription: string,
): JobContext {
  const normalizedDescription =
    jobDescription
      .trim()
      .toLowerCase();

  return {
    rawDescription: jobDescription,

    normalizedDescription,

    frequencyMap: {},

    keywords: Array.from(
      new Set(
        extractJobKeywords(
          normalizedDescription,
        ),
      ),
    ),
  };
}