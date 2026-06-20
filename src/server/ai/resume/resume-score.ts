import { calculateATS } from "@/server/ai/resume/ats-engine";
import { parseResumeContent } from "@/server/utils/resume-parser";

import { ResumeScoreResult } from "@/server/types/score.types";
import { z } from "zod"; // ✅ Added for validation
import { canonicalizeSkill } from "./skill-normalizer";
import { buildResumeContext } from "./resume-context";

// ======================================================
// TYPES
// ======================================================

interface ParsedResume {
  summary: string;
  skills: string[];

  experience: Array<{
    role: string;
    company: string;
    description: string;
  }>;

  education: Array<{
  degree: string;
  institution: string;
  duration: string;
}>;

  
}

// ✅ Zod schema for runtime validation
const ResumeSchema = z.object({
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        role: z.string().default(""),
        company: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        school: z.string().optional(),
      }),
    )
    .default([]),
 
});

// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_ATS_SCORE = 50;

const ACTION_VERBS = [
  "built",
  "developed",
  "implemented",
  "optimized",
  "designed",
  "created",
  "launched",
  "improved",
  "scaled",
  "led",
  "managed",
  "architected",
  "integrated",
  "automated",
];

const METRIC_REGEX =
  /\d+%|\d+x|\$\d+|\d+\s?(users|clients|customers|ms|seconds|minutes|hours)/i;

// ======================================================
// HELPERS
// ======================================================

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function calculateWeightedScore(scores: {
  contentScore: number;
  skillScore: number;
  experienceScore: number;
  atsScore: number;
  completenessScore: number;
}) {
  return clampScore(
    scores.contentScore * 0.25 +
    scores.skillScore * 0.20 +
    scores.experienceScore * 0.25 +
    scores.atsScore * 0.20 +
    scores.completenessScore * 0.10
  );
}

const completenessScore =
  calculateCompleteness(resume);

const profileScore =
  calculateWeightedScore({
    contentScore,
    skillScore,
    experienceScore,
    atsScore,
    completenessScore,
  });

// ======================================================
// CONTENT SCORE
// ======================================================

function calculateContentScore(resume: ParsedResume): number {
  let score = 0;
  const summaryWords =
  resume.summary
    .split(/\s+/)
    .filter(Boolean).length;

if (summaryWords >= 25) {
  score += 10;
}

  if (resume.summary.length >= 50) {
    score += 15;
  }

  if (resume.summary.length >= 120) {
    score += 10;
  }

  if (resume.skills.length >= 5) {
    score += 15;
  }

  if (resume.experience.length >= 1) {
    score += 20;
  }



  if (resume.education.length >= 1) {
    score += 10;
  }

  const experienceDescriptions = resume.experience.map((exp) =>
    normalizeText(exp.description),
  );

  const hasGoodDescriptions = experienceDescriptions.some(
    (desc) => desc.length >= 120,
  );

  if (hasGoodDescriptions) {
    score += 15;
  }

  return clampScore(score);
}

// ======================================================
// SKILL SCORE
// ======================================================


function calculateCompleteness(
  resume: ParsedResume
): number {
  let score = 0;

  if (resume.summary.length > 0)
    score += 25;

  if (resume.skills.length > 0)
    score += 25;

  if (resume.experience.length > 0)
    score += 25;

  if (resume.education.length > 0)
    score += 25;

  return score;
}
function calculateSkillScore(
  resume: ParsedResume
): number {
  const skills = resume.skills.map(
    canonicalizeSkill
  );

  const modernSkills = [
    "react",
    "next.js",
    "typescript",
    "node.js",
    "postgresql",
    "mongodb",
    "docker",
    "aws",
    "prisma",
    "graphql",
    "kubernetes",
  ];

  const matchedModernSkills =
    modernSkills.filter((skill) =>
      skills.includes(skill)
    ).length;

  let score = 30;

  score += Math.min(
    skills.length * 3,
    30,
  );

  score += matchedModernSkills * 4;

  return clampScore(score);
}

// ======================================================
// EXPERIENCE SCORE
// ======================================================

function calculateExperienceScore(resume: ParsedResume): number {
  if (resume.experience.length === 0) {
    return 20;
  }

  let score = 0;

  for (const exp of resume.experience) {
    const description = normalizeText(exp.description);

    if (description.length >= 100) {
      score += 10;
    }

    if (description.length >= 200) {
      score += 10;
    }
    const hasRole =
  exp.role.trim().length > 0;

if (hasRole) {
  score += 5;
}

const hasCompany =
  exp.company.trim().length > 0;

if (hasCompany) {
  score += 5;
}

    if (METRIC_REGEX.test(description)) {
      score += 20;
    }

    const hasActionVerb = ACTION_VERBS.some((verb) =>
      description.toLowerCase().includes(verb),
    );

    if (hasActionVerb) {
      score += 10;
    }
  }

  return clampScore(score / Math.max(1, resume.experience.length));
}

// ======================================================
// IMPROVEMENT TIPS
// ======================================================

function generateDeterministicTips(params: {
  contentScore: number;
  skillScore: number;
  experienceScore: number;
  atsScore: number;

  resume: ParsedResume;
}): string[] {
  const tips: string[] = [];

  if (params.atsScore < 70) {
    tips.push(
      "Improve ATS compatibility by adding more role-specific keywords throughout the resume.",
    );
  }

  if (params.skillScore < 70) {
    tips.push(
      "Add more relevant technical skills to strengthen your overall profile.",
    );
  }

  if (params.experienceScore < 70) {
    tips.push(
      "Use quantified achievements and measurable impact in your experience descriptions.",
    );
  }

  if (params.resume.summary.length < 80) {
    tips.push(
      "Write a stronger professional summary highlighting your technical strengths and experience.",
    );
  }

  

  if (params.resume.skills.length < 5) {
    tips.push(
      "Expand your skills section with frameworks, tools, and technologies relevant to your target roles.",
    );
  }

  return tips.slice(0, 5);
}

// ======================================================
// MAIN SCORE ENGINE
// ======================================================

export async function calculateResumeScore(
  resumeContent: unknown,
  jobDescription?: string,
): Promise<ResumeScoreResult> {
  // ✅ Validation step added
const context =
  buildResumeContext(
    resumeContent,
  );

const resume =
  ResumeSchema.parse(
    context.parsed,
  ) as ParsedResume; 

  const ats = jobDescription
    ?  calculateATS(resumeContent, {jobDescription}) // ensure async if needed
    : null;

  const atsScore = ats?.score ?? DEFAULT_ATS_SCORE;

  const contentScore = calculateContentScore(resume);
  const skillScore = calculateSkillScore(resume);
  const experienceScore = calculateExperienceScore(resume);

  const profileScore = calculateWeightedScore({
    contentScore,
    skillScore,
    experienceScore,
    atsScore,
  });

  const tips = generateDeterministicTips({
    contentScore,
    skillScore,
    experienceScore,
    atsScore,
    resume,
  });

  return {
    profileScore,
    contentScore,
    skillScore,
    experienceScore,
    atsScore,
    tips,
  };
}
