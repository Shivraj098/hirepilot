export type ResumeContent = {
  summary?: string;
  experience?: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    duration: string;
  }[];
};

/*
====================================
normalize text
====================================
*/

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.js/g, "js")
    .replace(/[^a-z0-9+#.\s]/g, "")
    .trim();
}

/*
====================================
split words
====================================
*/

function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,\/\-+]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/*
====================================
COMMON TECH SKILLS
expandable later
====================================
*/

const commonTechSkills = [
  "react",
  "reactjs",
  "next",
  "nextjs",
  "node",
  "nodejs",
  "typescript",
  "javascript",
  "java",
  "python",
  "aws",
  "docker",
  "postgres",
  "postgresql",
  "mongodb",
  "sql",
  "mysql",
  "prisma",
  "tailwind",
  "html",
  "css",
  "c",
  "cpp",
  "c++",
  "git",
  "github",
];

/*
====================================
extract resume skills
====================================
*/

export function extractResumeSkills(
  content: unknown
): string[] {
  if (!content || typeof content !== "object")
    return [];

  const data = content as {
    skills?: unknown[];
  };

  if (!Array.isArray(data.skills)) return [];

  return data.skills
    .map((skill) =>
      normalize(String(skill))
    )
    .filter(Boolean);
}

/*
====================================
extract job keywords
====================================
*/

export function extractJobKeywords(
  description: string
): string[] {
  if (!description) return [];

  const text = normalize(description);

  const words = splitWords(text);

  const found: string[] = [];

  // match common tech skills
  for (const skill of commonTechSkills) {
    if (text.includes(skill)) {
      found.push(skill);
    }
  }

  // also include frequent words
  for (const word of words) {
    if (word.length > 3) {
      found.push(word);
    }
  }

  // unique
  return Array.from(new Set(found));
}