import { calculateATS } from "@/server/ai/resume/ats-engine";
import { parseResumeContent } from "@/server/utils/resume-parser";

import { ResumeScoreResult } from "@/server/types/score.types";
import { z } from "zod"; // ✅ Added for validation

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
    degree?: string;
    school?: string;
  }>;

  projects: Array<{
    title?: string;
    description?: string;
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
  projects: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
});

// ======================================================
// CONSTANTS
// ======================================================

const DEFAULT_ATS_SCORE = 70;

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
}): number {
  return clampScore(
    scores.contentScore * 0.3 +
      scores.skillScore * 0.25 +
      scores.experienceScore * 0.3 +
      scores.atsScore * 0.15,
  );
}

// ======================================================
// CONTENT SCORE
// ======================================================

function calculateContentScore(resume: ParsedResume): number {
  let score = 0;

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

  if (resume.projects.length >= 1) {
    score += 15;
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

function calculateSkillScore(resume: ParsedResume): number {
  const totalSkills = resume.skills.length;

  if (totalSkills >= 15) {
    return 95;
  }

  if (totalSkills >= 12) {
    return 85;
  }

  if (totalSkills >= 8) {
    return 75;
  }

  if (totalSkills >= 5) {
    return 65;
  }

  if (totalSkills >= 3) {
    return 50;
  }

  return 30;
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

  if (params.resume.projects.length === 0) {
    tips.push(
      "Add project experience to demonstrate practical technical implementation skills.",
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
  const parsed = parseResumeContent(resumeContent);
  const resume = ResumeSchema.parse(parsed) as ParsedResume;

  const ats = jobDescription
    ? await calculateATS(resumeContent, jobDescription) // ensure async if needed
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
