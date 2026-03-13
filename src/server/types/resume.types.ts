export type ExperienceItem = {
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
};

export type EducationItem = {
  institution?: string;
  degree?: string;
  duration?: string;
};

export type ResumeContent = {
  summary?: string;
  experience?: ExperienceItem[];
  skills?: string[];
  education?: EducationItem[];
};

export type StructuredResumeContent =
  ResumeContent;