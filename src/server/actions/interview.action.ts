"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { generateInterviewPrep } from "@/server/ai/interview-generator";
import { generateAIInterviewPrep } from "@/server/ai/interview-ai";
import { generateSectionSuggestions } from "@/server/ai/suggestion-engine";
import { calculateSkillGap } from "@/server/ai/skill-gap";
import { tailorResumeWithAI } from "@/server/ai/tailor";
import { recalculateATS } from "@/server/ai/recalculate-ats";

import type {
  ResumeContent,
  StructuredResumeContent,
} from "@/server/types/resume.types";

import type { InterviewPrepResult } from "@/server/ai/interview-generator";

/* =========================================================
   CREATE TAILORED VERSION WITH AI
========================================================= */

export async function createTailoredVersionWithAI(
  resumeId: string,
  jobId: string,
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  // ---------- BASE VERSION ----------

  const baseVersion = await prisma.resumeVersion.findFirst({
    where: {
      resumeId,
      userId: user.id,
      versionType: "BASE",
    },
  });

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!baseVersion || !job) {
    throw new Error("Invalid data");
  }

  // ---------- AI TAILOR ----------

  const tailoredContent = await tailorResumeWithAI(
    baseVersion.content as ResumeContent,
    job.description,
  );

  // ---------- CREATE VERSION ----------

  const newVersion = await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      jobId,
      content: tailoredContent,
      versionType: "TAILORED",
    },
  });

  // ---------- ATS ----------

  await recalculateATS(newVersion.id);

  // ---------- SKILL GAP ----------

  const skillGap = calculateSkillGap(tailoredContent, job.description);

  // ---------- SUGGESTIONS ----------

  const suggestions = await generateSectionSuggestions(
    tailoredContent as StructuredResumeContent,
    skillGap,
    job.description,
  );

  if (suggestions.length > 0) {
    await prisma.aISuggestion.createMany({
      data: suggestions.map((s) => ({
        resumeVersionId: newVersion.id,
        section: s.section,
        originalContent: s.originalContent,
        suggestedContent: s.suggestedContent,
        applied: false,
      })),
    });
  }

  // ---------- SKILL GAP DB ----------

  await prisma.skillGap.deleteMany({
    where: { jobId: job.id },
  });

  const gaps = skillGap.missingSkills.map((skill) => {
    const frequency = skillGap.jobFrequencyMap?.[skill] ?? 1;

    let priority: "HIGH" | "MEDIUM" | "LOW";

    if (frequency >= 2) {
      priority = "HIGH";
    } else if (frequency === 1) {
      priority = "MEDIUM";
    } else {
      priority = "LOW";
    }

    return {
      jobId: job.id,
      skill,
      priority,
      estimatedTime:
        priority === "HIGH"
          ? "2-4 weeks"
          : priority === "MEDIUM"
            ? "1-2 weeks"
            : "Few days",
      reasoning:
        frequency >= 2
          ? "Skill appears multiple times in job description"
          : "Skill required by job",
    };
  });

  if (gaps.length > 0) {
    await prisma.skillGap.createMany({
      data: gaps,
    });
  }

  // ---------- INTERVIEW ----------

  await prisma.interviewPrep.deleteMany({
    where: { jobId: job.id },
  });

  let interview: InterviewPrepResult | null = null;

  try {
    interview = await generateAIInterviewPrep(
      job.title,
      job.description,
      skillGap.matchedSkills,
    );
  } catch {
    interview = await generateInterviewPrep(
      job.title,
      job.description,
      skillGap.matchedSkills,
    );
  }

  if (interview) {
    await prisma.interviewPrep.create({
      data: {
        jobId: job.id,
        type: "FULL",
        questions: interview.questions,
        starDrafts: interview.starDrafts,
        technicalTopics: interview.technicalTopics,
      },
    });
  }

  return newVersion;
}

/* =========================================================
   REGENERATE INTERVIEW
========================================================= */

export async function regenerateInterviewPrep(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) throw new Error("Job not found");

  const latestVersion = job.versions[0];

  if (!latestVersion) throw new Error("No version");

  const ats = await prisma.aTSResult.findFirst({
    where: {
      resumeVersionId: latestVersion.id,
    },
  });

  let interview: InterviewPrepResult | null = null;

  try {
    interview = await generateAIInterviewPrep(
      job.title,
      job.description,
      (ats?.matchedKeywords as string[]) ?? [],
    );
  } catch {
    interview = await generateInterviewPrep(
      job.title,
      job.description,
      (ats?.matchedKeywords as string[]) ?? [],
    );
  }

  await prisma.interviewPrep.deleteMany({
    where: { jobId },
  });

  if (interview) {
    await prisma.interviewPrep.create({
      data: {
        jobId,
        type: "FULL",
        questions: interview.questions,
        starDrafts: interview.starDrafts,
        technicalTopics: interview.technicalTopics,
      },
    });
  }

  revalidatePath(`/dashboard/jobs/${jobId}`);
}
