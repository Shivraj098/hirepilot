type ResumeExperience = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type ResumeEducation = {
  institution: string;
  degree: string;
  duration: string;
};

export type ParsedResumeContent = {
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
};

/*
====================================
normalize skill
====================================
*/

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

/*
====================================
safe string
====================================
*/

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}

/*
====================================
safe array
====================================
*/

function safeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

/*
====================================
parse resume content
====================================
*/

export function parseResumeContent(
  content: unknown
): ParsedResumeContent {
  const obj = (content ?? {}) as Record<string, unknown>;

  const summary = safeString(obj.summary);

  const skillsRaw = safeArray<string>(obj.skills);

  const skills = skillsRaw
    .map(normalizeSkill)
    .filter((s) => s.length > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experienceRaw = safeArray<any>(obj.experience);

  const experience: ResumeExperience[] =
    experienceRaw.map((exp) => ({
      company: safeString(exp.company),
      role: safeString(exp.role),
      duration: safeString(exp.duration),
      description: safeString(exp.description),
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const educationRaw = safeArray<any>(obj.education);

  const education: ResumeEducation[] =
    educationRaw.map((edu) => ({
      institution: safeString(edu.institution),
      degree: safeString(edu.degree),
      duration: safeString(edu.duration),
    }));

  return {
    summary,
    skills,
    experience,
    education,
  };
}