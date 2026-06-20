"use server";
import { Difficulty, Priority } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateInterviewPrep } from "@/server/ai/interview/interview-generator";
import { generateSectionSuggestions } from "@/server/ai/resume/suggestion-engine";
import { calculateSkillGap } from "@/server/ai/skills/skill-gap";
import { tailorResumeWithAI } from "@/server/ai/resume/tailor";
import { recalculateResumePipeline } from "../orchestrators/resume-orchestrator";
import type { ResumeContent } from "@/server/types/resume.types";
import type { InterviewPrepResult } from "@/server/types/ai.types";

export async function createTailoredVersionWithAI(
  resumeId: string,
  jobId: string,
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  // STEP 1 — Get base version and job
  const baseVersion = await prisma.resumeVersion.findFirst({
    where: {
      resumeId,
      userId: user.id,
      versionType: "BASE",
    },
  });

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!baseVersion || !job) throw new Error("Invalid data");

  // STEP 2 — AI tailor resume
  const tailored = await tailorResumeWithAI(
    baseVersion.content as ResumeContent,
    job.description,
  );

  const tailoredContent = tailored.content;

  // STEP 3 — Create new tailored version in DB
  const newVersion = await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      jobId,
      content: tailoredContent,
      versionType: "TAILORED",
      parentId: baseVersion.id,
      createdBy: "AI",
      label: `AI Tailored for ${job.title}`,
    },
  });

  // STEP 4 — Recalculate ATS pipeline
  await recalculateResumePipeline(newVersion.id, user.id);

  // STEP 5 — Skill gap analysis
  const skillGap = calculateSkillGap(tailoredContent, job.description);

  // STEP 6 — AI suggestions
  const suggestions = await generateSectionSuggestions(
    tailoredContent,
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

  // STEP 7 — Save skill gaps
  await prisma.skillGap.deleteMany({ where: { jobId: job.id } });

  const gaps = skillGap.missingSkills.map((skill) => {
    const frequency = skillGap.jobFrequencyMap?.[skill] ?? 1;
    const priority: "HIGH" | "MEDIUM" | "LOW" =
      frequency >= 2 ? "HIGH" : frequency === 1 ? "MEDIUM" : "LOW";

    return {
      jobId: job.id,
      skill,
      priority: priority as Priority,
      estimatedTime:
        priority === "HIGH" ? "2-4 weeks" :
        priority === "MEDIUM" ? "1-2 weeks" : "Few days",
      reasoning:
        frequency >= 2
          ? "Skill appears multiple times in job description"
          : "Skill required by job",
    };
  });

  if (gaps.length > 0) {
    await prisma.skillGap.createMany({ data: gaps });
  }

  // STEP 8 — Generate interview prep
  await prisma.interviewPrep.deleteMany({ where: { jobId: job.id } });

  const interview: InterviewPrepResult = await generateInterviewPrep(
    job.title,
    job.description,
    skillGap.matchedSkills,
    skillGap.missingSkills,
    skillGap.matchPercentage,
  );

  await prisma.interviewPrep.create({
    data: {
      jobId: job.id,
      type: "FULL",
      questions: interview.questions,
      starDrafts: interview.starDrafts,
      technicalTopics: interview.technicalTopics,
      focusAreas:interview.focusAreas,
      difficulty: (interview.difficulty as Difficulty) ?? Difficulty.MEDIUM,
      category: interview.category,
    },
  });

  revalidatePath(`/dashboard/resumes/${resumeId}`);
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidatePath("/dashboard");

  return newVersion;
}

export async function regenerateInterviewPrep(jobId: string) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id },
  });

  if (!job) throw new Error("Job not found");

  // Fetch latest version separately — avoids Prisma Accelerate include type issue
const latestVersion =
  await prisma.resumeVersion.findFirst({
    where: {
      jobId,
      userId: user.id,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestVersion) throw new Error("No version found");

 

const skillGap =
  calculateSkillGap(
    latestVersion.content,
    job.description,
  );

const interview =
  await generateInterviewPrep(
    job.title,

    job.description,

    skillGap.matchedSkills,

    skillGap.missingSkills,

    skillGap.matchPercentage,
  );

  await prisma.interviewPrep.deleteMany({ where: { jobId } });

  await prisma.interviewPrep.create({
    data: {
      jobId,
      type: "FULL",
      questions: interview.questions,
      starDrafts: interview.starDrafts,
      technicalTopics: interview.technicalTopics,
      focusAreas:
  interview.focusAreas,
      difficulty: (interview.difficulty as Difficulty) ?? Difficulty.MEDIUM,
      category: interview.category,
    },
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
}