import { parseResumeContent } from "@/server/utils/resume-parser";

export type ATSResultData = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  weakKeywords: string[];
  sectionScores: {
    skills: number;
    experience: number;
    summary: number;
  };
};

// ==============================
// STOP WORDS
// ==============================

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "have", "from",
  "will", "your", "are", "you", "not", "but", "they", "all",
  "been", "has", "its", "who", "one", "our", "out", "can",
  "her", "his", "him", "she", "was", "were", "what", "when",
  "how", "why", "each", "also", "must", "should", "would",
  "could", "work", "team", "role", "good", "strong", "well",
  "experience", "ability", "skills", "knowledge", "understanding",
  "years", "year", "plus", "using", "including", "required",
  "preferred", "looking", "seeking", "join", "help", "build",
  "work", "working", "support", "ensure", "provide", "manage",
  "develop", "create", "design", "implement", "maintain",
]);

// ==============================
// TECH SYNONYMS
// ==============================

const TECH_SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  node: ["nodejs", "node.js"],
  typescript: ["ts"],
  javascript: ["js"],
  postgresql: ["postgres"],
  "next.js": ["nextjs", "next"],
  "vue.js": ["vuejs", "vue"],
  "express.js": ["expressjs", "express"],
  kubernetes: ["k8s"],
  elasticsearch: ["elastic"],
};

function buildSynonymMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, synonyms] of Object.entries(TECH_SYNONYMS)) {
    for (const synonym of synonyms) {
      map.set(synonym, canonical);
    }
  }
  return map;
}

const synonymMap = buildSynonymMap();

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.js$/i, "js")
    .replace(/[^a-z0-9+#.]/g, " ")
    .trim();
}

function canonicalize(word: string): string {
  return synonymMap.get(word) ?? word;
}

function extractKeywordsFromText(text: string): string[] {
  const normalized = normalize(text);
  const words = normalized
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Also extract multi-word tech terms
  const multiWordTerms: string[] = [];
  const techTerms = [
    "machine learning", "deep learning", "natural language",
    "data science", "computer vision", "cloud computing",
    "rest api", "graphql api", "ci cd", "test driven",
  ];
  for (const term of techTerms) {
    if (normalized.includes(term)) {
      multiWordTerms.push(term.replace(/\s+/g, "-"));
    }
  }

  return [...new Set([...words, ...multiWordTerms].map(canonicalize))];
}

// ==============================
// MAIN ATS CALCULATION
// ==============================

export function calculateATS(
  resumeContent: unknown,
  jobDescription: string
): ATSResultData {
  const resume = parseResumeContent(resumeContent);

  if (!jobDescription || jobDescription.trim().length < 10) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      weakKeywords: [],
      sectionScores: { skills: 0, experience: 0, summary: 0 },
    };
  }

  // Extract keywords from all resume sections
  const resumeSkillsText = resume.skills.join(" ");
  const resumeExperienceText = resume.experience
    .map((e) => `${e.role} ${e.company} ${e.description}`)
    .join(" ");
  const resumeSummaryText = resume.summary;

  const resumeSkillKeywords = new Set(
    extractKeywordsFromText(resumeSkillsText)
  );
  const resumeExperienceKeywords = new Set(
    extractKeywordsFromText(resumeExperienceText)
  );
  const resumeSummaryKeywords = new Set(
    extractKeywordsFromText(resumeSummaryText)
  );

  const allResumeKeywords = new Set([
    ...resumeSkillKeywords,
    ...resumeExperienceKeywords,
    ...resumeSummaryKeywords,
  ]);

  // Extract and deduplicate job keywords
  const jobKeywords = [
    ...new Set(extractKeywordsFromText(jobDescription)),
  ];

  const matched: string[] = [];
  const missing: string[] = [];
  const weak: string[] = [];

  for (const kw of jobKeywords) {
    if (resumeSkillKeywords.has(kw)) {
      matched.push(kw);
    } else if (resumeExperienceKeywords.has(kw) || resumeSummaryKeywords.has(kw)) {
      // Present but not in skills section — weak match
      weak.push(kw);
      matched.push(kw);
    } else if (allResumeKeywords.has(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const total = matched.length + missing.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);

  // Section-level scores
  const skillMatches = jobKeywords.filter((k) =>
    resumeSkillKeywords.has(k)
  ).length;
  const expMatches = jobKeywords.filter((k) =>
    resumeExperienceKeywords.has(k)
  ).length;
  const summaryMatches = jobKeywords.filter((k) =>
    resumeSummaryKeywords.has(k)
  ).length;

  const skillScore =
    jobKeywords.length === 0
      ? 0
      : Math.round((skillMatches / jobKeywords.length) * 100);
  const expScore =
    jobKeywords.length === 0
      ? 0
      : Math.round((expMatches / jobKeywords.length) * 100);
  const summaryScore =
    jobKeywords.length === 0
      ? 0
      : Math.round((summaryMatches / jobKeywords.length) * 100);

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    weakKeywords: weak,
    sectionScores: {
      skills: skillScore,
      experience: expScore,
      summary: summaryScore,
    },
  };
}