import { parseResumeContent } from "@/server/utils/resume-parser";
import { aiJsonCompletion } from "@/server/ai/core/client";
import { logError } from "@/server/utils/logger";
import { ATSResult } from "@/server/types/score.types";

// ==============================
// TECH SYNONYMS
// ==============================

const TECH_SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  node: ["nodejs", "node.js"],
  typescript: ["ts"],
  javascript: ["js", "es6", "es2015"],
  postgresql: ["postgres", "psql"],
  "next.js": ["nextjs", "next"],
  python: ["py"],
  kubernetes: ["k8s"],
};

function buildSynonymMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [canonical, synonyms] of Object.entries(TECH_SYNONYMS)) {
    for (const synonym of synonyms) {
      map.set(synonym.toLowerCase(), canonical);
    }
  }
  return map;
}

const synonymMap = buildSynonymMap();

function canonicalize(word: string): string {
  return synonymMap.get(word.toLowerCase()) ?? word.toLowerCase();
}

// ==============================
// AI-POWERED JOB SKILL EXTRACTION
// ==============================

const SKILL_EXTRACTION_SYSTEM = `You are a technical recruiter expert at identifying required skills from job descriptions.
Extract ONLY actual technical skills, tools, technologies, and professional competencies.
Never extract generic words, company names, or filler phrases.
Return valid JSON only.`;

async function extractJobSkillsWithAI(
  jobDescription: string,
): Promise<string[]> {
  if (!jobDescription || jobDescription.trim().length < 20) return [];

  const userPrompt = `Extract all technical skills, tools, technologies, and professional competencies from this job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return JSON:
{
  "skills": ["skill1", "skill2", ...]
}

Rules:
- Only include actual skills, technologies, tools, frameworks
- Include soft skills like "communication", "teamwork" if explicitly required
- Do NOT include company names, generic words like "experience", "opportunity", "fresher"
- If the job has no technical skills mentioned, return skills based on the role title
- Normalize skill names (React not ReactJS, Node.js not NodeJS)
- Maximum 20 skills`;

  const result = await aiJsonCompletion<{ skills: string[] }>(
    SKILL_EXTRACTION_SYSTEM,
    userPrompt,
    { temperature: 0.1 },
  );

  return result?.skills ?? [];
}

// ==============================
// RULE-BASED FALLBACK SKILL EXTRACTION
// ==============================

const KNOWN_TECH_SKILLS = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "go",
  "rust",
  "php",
  "swift",
  "kotlin",
  "scala",
  "r",
  "react",
  "vue",
  "angular",
  "svelte",
  "next.js",
  "nuxt",
  "gatsby",
  "node.js",
  "express",
  "fastapi",
  "django",
  "flask",
  "spring",
  "laravel",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "sqlite",
  "oracle",
  "cassandra",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "terraform",
  "ansible",
  "git",
  "github",
  "gitlab",
  "jira",
  "figma",
  "linux",
  "graphql",
  "rest",
  "grpc",
  "websocket",
  "microservices",
  "machine learning",
  "deep learning",
  "tensorflow",
  "pytorch",
  "pandas",
  "sql",
  "nosql",
  "prisma",
  "mongoose",
  "sequelize",
  "tailwind",
  "css",
  "html",
  "sass",
  "communication",
  "teamwork",
  "leadership",
  "problem-solving",
]);

function extractSkillsFromText(text: string): string[] {
  const normalized = text.toLowerCase();
  const found: string[] = [];

  for (const skill of KNOWN_TECH_SKILLS) {
    if (normalized.includes(skill)) {
      found.push(skill);
    }
  }

  return [...new Set(found)];
}

// ==============================
// MAIN ATS CALCULATION
// ==============================

export async function calculateATSAsync(
  resumeContent: unknown,
  jobDescription: string,
): Promise<ATSResult> {
  const empty: ATSResult = {
    score: 0,
    matchedKeywords: [],
    missingKeywords: [],
    weakKeywords: [],
    sectionScores: { skills: 0, experience: 0, summary: 0 },
  };

  if (!jobDescription || jobDescription.trim().length < 10) {
    return empty;
  }

  // Extract job skills using AI first, fallback to rule-based
  let jobSkills: string[] = [];
  try {
    jobSkills = await extractJobSkillsWithAI(jobDescription);
  } catch (err) {
    logError("AI skill extraction failed, using fallback", err);
    jobSkills = extractSkillsFromText(jobDescription);
  }

  // If still empty (generic job description), extract from role title/context
  if (jobSkills.length === 0) {
    jobSkills = extractSkillsFromText(jobDescription);
  }

  // If truly no skills in JD, give a baseline score
  if (jobSkills.length === 0) {
    return {
      score: 50, // Neutral score when JD has no tech requirements
      matchedKeywords: [],
      missingKeywords: [],
      weakKeywords: [],
      sectionScores: { skills: 50, experience: 50, summary: 50 },
    };
  }

  return calculateATS(resumeContent, {
    jobDescription,
    jobSkills,
  });
}

// Sync version for places that can't await (kept for backward compat)
export function calculateATS(
  resumeContent: unknown,

  options: {
    jobDescription?: string;

    jobSkills?: string[];
  },
): ATSResult {
  const resume = parseResumeContent(resumeContent);

  const jobDescription = options.jobDescription || "";

  if (!jobDescription || jobDescription.trim().length < 10) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      weakKeywords: [],
      sectionScores: { skills: 0, experience: 0, summary: 0 },
    };
  }

  // Use rule-based only for sync version
  const jobSkills = options.jobSkills?.length
    ? options.jobSkills
    : extractSkillsFromText(options.jobDescription ?? "");

  if (jobSkills.length === 0) {
    return {
      score: 50,
      matchedKeywords: [],
      missingKeywords: [],
      weakKeywords: [],
      sectionScores: { skills: 50, experience: 50, summary: 50 },
    };
  }

  const normalizedJobSkills = [...new Set(jobSkills.map(canonicalize))];
  const resumeSkillKeywords = new Set(resume.skills.map(canonicalize));
  const resumeExpText = resume.experience
    .map((e) => `${e.role} ${e.description}`)
    .join(" ")
    .toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];
  const weak: string[] = [];

  for (const skill of normalizedJobSkills) {
    if (resumeSkillKeywords.has(skill)) {
      matched.push(skill);
    } else if (resumeExpText.includes(skill)) {
      weak.push(skill);
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const total = matched.length + missing.length;
  const score = total === 0 ? 50 : Math.round((matched.length / total) * 100);

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    weakKeywords: weak,
    sectionScores: { skills: score, experience: score, summary: score },
  };
}
