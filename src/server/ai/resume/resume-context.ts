import { parseResumeContent } from "@/server/utils/resume-parser";
import { extractResumeSkills } from "./extractors";

export type ResumeContext = {
  parsed: ReturnType<
    typeof parseResumeContent
  >;

  normalizedSkills: string[];

  experienceText: string;

  summaryText: string;
};

export function buildResumeContext(
  resumeContent: unknown,
): ResumeContext {
  const parsed =
    parseResumeContent(
      resumeContent,
    );

  return {
    parsed,

    normalizedSkills:
  Array.from(
    new Set(
      extractResumeSkills(
        parsed,
      ),
    ),
  ),

    experienceText:
      parsed.experience
        .map(
          (
            exp,
          ) =>
            `${exp.role} ${exp.company} ${exp.description}`,
        )
        .join(" ")
        .toLowerCase(),

    summaryText:
      parsed.summary
        .toLowerCase(),
  };
}

export function hasSkill(
  context: ResumeContext,
  skill: string,
): boolean {
  return context.normalizedSkills.includes(
    skill.toLowerCase(),
  );
}