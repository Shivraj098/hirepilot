import { parseResumeContent } from "./utils/resume-parser";

type CompareResult = {
  skillsAdded: string[];
  skillsRemoved: string[];

  summaryChanged: boolean;

  experienceAdded: number;
  experienceRemoved: number;

  educationAdded: number;
  educationRemoved: number;
};

function diffArray(
  a: string[],
  b: string[]
) {
  const added = b.filter(
    (x) => !a.includes(x)
  );

  const removed = a.filter(
    (x) => !b.includes(x)
  );

  return { added, removed };
}

export function compareVersions(
  baseContent: unknown,
  newContent: unknown
): CompareResult {

  const base =
    parseResumeContent(
      baseContent
    );

  const next =
    parseResumeContent(
      newContent
    );

  const skillDiff =
    diffArray(
      base.skills,
      next.skills
    );

  const summaryChanged =
    base.summary !==
    next.summary;

  const experienceAdded =
    next.experience.length -
    base.experience.length;

  const experienceRemoved =
    base.experience.length -
    next.experience.length;

  const educationAdded =
    next.education.length -
    base.education.length;

  const educationRemoved =
    base.education.length -
    next.education.length;

  return {
    skillsAdded:
      skillDiff.added,
    skillsRemoved:
      skillDiff.removed,
    summaryChanged,
    experienceAdded:
      Math.max(
        0,
        experienceAdded
      ),
    experienceRemoved:
      Math.max(
        0,
        experienceRemoved
      ),
    educationAdded:
      Math.max(
        0,
        educationAdded
      ),
    educationRemoved:
      Math.max(
        0,
        educationRemoved
      ),
  };
}