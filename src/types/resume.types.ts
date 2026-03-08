export type ExperienceItem = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

export type ResumeContent = {
  summary?: string;
  experience?: ExperienceItem[];
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    duration: string;
  }[];
};


export type StructuredResumeContent = ResumeContent;