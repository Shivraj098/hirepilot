"use server";
import { recalculateResumePipeline } from "../orchestrators/resume-orchestrator";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { analyzeJob } from "@/server/ai/job/job-intelligence";
import { analyzeJobMatch } from "@/server/ai/job/job-match";
import { calculateResumeScore } from "../ai/resume/resume-score";
import {
  saveJobAnalysis,
  saveMatchResult,
} from "@/server/features/analysis/analysis.service";
import {
  saveResumeAnalysis,
  saveScoreHistory,
} from "@/server/features/analysis/analysis.service";
import { logActivity } from "@/server/features/activity/activity.service";
import { saveTailorResult } from "../features/tailor/tailor.service";
type ExperienceItem = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type ResumeContent = {
  summary?: string;
  experience?: ExperienceItem[];
  skills?: string[];
  education?: {
    institution: string;
    degree: string;
    duration: string;
  }[];
};

// ===== Resume CRUD =====

export async function createResume(title: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const resume = await prisma.resume.create({
    data: {
      title,
      userId: user.id,
      versions: {
        create: {
          userId: user.id,
          content: {
            summary: "",
            experience: [],
            skills: [],
            education: [],
          } as Prisma.InputJsonValue,
          versionType: "BASE",
        },
      },
    },
  });

  await logActivity({
    userId: user.id,
    type: "RESUME_CREATED",
    message: "Created resume",
  });

  revalidatePath("/dashboard");
  return resume;
}

export async function updateResumeSummary(resumeId: string, summary: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const updatedContent = {
    ...content,
    summary,
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });
  

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function addExperience(
  resumeId: string,
  experienceItem: ExperienceItem,
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const updatedContent = {
    ...content,
    experience: [
      ...(Array.isArray(content.experience) ? content.experience : []),
      experienceItem,
    ],
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

    
  revalidatePath(`/dashboard/${resumeId}`);
}

export async function removeExperience(resumeId: string, index: number) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const currentExperience = Array.isArray(content.experience)
    ? content.experience
    : [];

  const updatedExperience = currentExperience.filter((_item, i) => i !== index);

  const updatedContent = {
    ...content,
    experience: updatedExperience,
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function addSkill(resumeId: string, skill: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const updatedContent = {
    ...content,
    skills: [...(Array.isArray(content.skills) ? content.skills : []), skill],
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function removeSkill(resumeId: string, index: number) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const currentSkills = Array.isArray(content.skills) ? content.skills : [];

  const updatedSkills = currentSkills.filter((_skill, i) => i !== index);

  const updatedContent = {
    ...content,
    skills: updatedSkills,
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function addEducation(
  resumeId: string,
  educationItem: {
    institution: string;
    degree: string;
    duration: string;
  },
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) throw new Error("Base version not found");

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const updatedContent = {
    ...content,
    education: [
      ...(Array.isArray(content.education) ? content.education : []),
      educationItem,
    ],
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function removeEducation(resumeId: string, index: number) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) throw new Error("Base version not found");

  const content = (baseVersion.content ?? {}) as ResumeContent;

  const currentEducation = Array.isArray(content.education)
    ? content.education
    : [];

  const updatedEducation = currentEducation.filter((_item, i) => i !== index);

  const updatedContent = {
    ...content,
    education: updatedEducation,
  };

  await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      content: updatedContent,
      parentId: baseVersion.id,
      versionType: "BASE",
      createdBy: "USER",
    },
  });

  revalidatePath(`/dashboard/${resumeId}`);
}

export async function createTailoredVersionForJob(
  resumeId: string,
  jobId: string,
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify job belongs to user
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const tailoredVersion = await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      jobId: job.id,

      content: (baseVersion.content ?? {}) as Prisma.InputJsonValue,

      versionType: "TAILORED",

      parentId: baseVersion.id,

      label: `Tailored for ${job.title}`,

      createdBy: "AI",

      scoreSnapshot: null,
    },
  });

  await saveTailorResult({
    baseVersionId: baseVersion.id,
    newVersionId: tailoredVersion.id,
    jobId: job.id,
    userId: user.id,
  });

  await recalculateResumePipeline(tailoredVersion.id, user.id);

  await logActivity({
    userId: user.id,

    type: "RESUME_TAILORED",
    message: `Tailored resume for ${job.title}`,
  });
  

  revalidatePath(`/dashboard/${resumeId}`);
  revalidatePath("/dashboard");

  return tailoredVersion;
}

import { analyzeResumeProfile } from "../ai/resume/resume-intelligence";
import { getLatestVersion } from "../features/version/version.service";

export async function analyzeResume(resumeId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const result = await analyzeResumeProfile(baseVersion.content);

  if (result) {
    await saveResumeAnalysis({
      resumeVersionId: baseVersion.id,
      userId: user.id,

      profileScore: result.profileScore,

      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendedSkills: result.recommendedSkills,
    });
  }

  await logActivity({
    userId: user.id,
    type: "RESUME_INTELLIGENCE",
    message: "Analyzed resume with AI",
  });

  return result;
}

export async function analyzeJobForUser(jobId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const result = await analyzeJob(job.description);
  if (result) {
    await saveJobAnalysis({
      jobId: job.id,
      userId: user.id,
      roleCategory: result.roleCategory,
      requiredLevel: result.requiredLevel,
      difficulty: result.difficulty,
      domain: result.domain,
      importantSkills: result.importantSkills,
      secondarySkills: result.secondarySkills,
    });

    await logActivity({
      userId: user.id,
      type: "JOB_INTELLIGENCE",
      message: "Job analyzed",
    });
  }

  return result;
}

export async function getJobMatch(resumeId: string, jobId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base not found");
  }

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const result = await analyzeJobMatch(baseVersion.content, job.description);

  if (result) {
    await saveMatchResult({
      resumeVersionId: baseVersion.id,
      jobId,
      userId: user.id,

      matchScore: result.matchScore,
      fitLevel: result.fitLevel,
      shouldApply: result.shouldApply,

      missingSkills: result.missingSkills ?? [],
      reason: result.reason ?? "",
    });

    await logActivity({
      userId: user.id,
      type: "MATCH_ANALYZED",
      message: "Job match analyzed",
    });
  }

  return result;
}

export async function getResumeScore(resumeId: string, jobId?: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const baseVersion = await getLatestVersion(resumeId, user.id);

  if (!baseVersion) {
    throw new Error("Base not found");
  }

  let jobDescription: string | undefined;

  if (jobId) {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
    });

    jobDescription = job?.description;
  }

  const result = await calculateResumeScore(
    baseVersion.content,
    jobDescription,
  );

  if (result) {
    await saveResumeAnalysis({
      resumeVersionId: baseVersion.id,
      userId: user.id,
      score: result.profileScore,
      atsScore: result.atsScore,
      profileScore: result.profileScore,
      contentScore: result.contentScore,
      skillScore: result.skillScore,
      experienceScore: result.experienceScore,
    });

    await saveScoreHistory({
      resumeVersionId: baseVersion.id,
      userId: user.id,
      score: result.profileScore,
      atsScore: result.atsScore,
    });

    await logActivity({
      userId: user.id,
      type: "RESUME_SCORED",
      message: "Resume scored",
    });
  }

  return result;
}
