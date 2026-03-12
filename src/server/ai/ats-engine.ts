import { parseResumeContent } from "./utils/resume-parser";

type ATSResultData = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  weakKeywords: string[];
};

function normalize(text: string) {
  return text.toLowerCase();
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zA-Z0-9+#.]+/)
    .filter((w) => w.length > 2);
}

export function calculateATS(
  resumeContent: unknown,
  jobDescription: string
): ATSResultData {
  const resume = parseResumeContent(resumeContent);

  const resumeSkills = resume.skills.map((s) =>
    normalize(s)
  );

  const jobKeywords = extractKeywords(jobDescription);

  const uniqueKeywords = Array.from(
    new Set(jobKeywords)
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of uniqueKeywords) {
    if (
      resumeSkills.some((s) =>
        s.includes(kw)
      )
    ) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const total = matched.length + missing.length;

  const score =
    total === 0
      ? 0
      : Math.round((matched.length / total) * 100);

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    weakKeywords: [],
  };
}