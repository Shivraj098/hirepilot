import {
  MIN_SUMMARY_LENGTH,
  MIN_SKILLS_COUNT,
} from "@/server/config/constants";
import { buildResumeContext } from "./resume-context";
export type ResumeHealth = {
  missingSummary: boolean;

  missingSkills: boolean;

  missingExperience: boolean;

  weakSkills: boolean;

  weakSummary: boolean;

  noMetrics: boolean;

  warnings: string[];
};

function hasNumbers(text: string) {
  return /\d/.test(text);
}

export function analyzeResumeHealth(resumeContent: unknown): ResumeHealth {
const context =
  buildResumeContext(
    resumeContent,
  );

const resume =
  context.parsed;
  const warnings: string[] = [];

  const missingSummary = !resume.summary;

  const missingSkills = resume.skills.length === 0;

  const missingExperience = resume.experience.length === 0;

  const weakSkills = resume.skills.length < MIN_SKILLS_COUNT;

  const weakSummary = resume.summary.length < MIN_SUMMARY_LENGTH;

  const noMetrics = !hasNumbers(JSON.stringify(resume.experience));

  if (missingSummary) warnings.push("Summary missing");

  if (missingSkills) warnings.push("No skills listed");

  if (missingExperience) warnings.push("No experience added");

  if (weakSkills) warnings.push("Too few skills");

  if (weakSummary) warnings.push("Summary too short");

  if (noMetrics) warnings.push("No measurable achievements");

  return {
    missingSummary,
    missingSkills,
    missingExperience,
    weakSkills,
    weakSummary,
    noMetrics,
    warnings,
  };
}
