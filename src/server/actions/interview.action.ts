"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateInterviewPrep } from "@/server/ai/interview-generator";
import { generateAIInterviewPrep } from "@/server/ai/interview-ai";
import { generateSectionSuggestions } from "@/server/ai/suggestion-engine";
import { calculateSkillGap } from "@/server/ai/skill-gap";
import {tailorResumeWithAI} from "@/server/ai/tailor";
       
import type {
  ResumeContent,
  StructuredResumeContent,
} from "@/types/resume.types";


export async function createTailoredVersionWithAI(
  resumeId: string,
  jobId: string,
) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

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

  // AI rewrite (currently mock-safe)
  const tailoredContent = await tailorResumeWithAI(
    baseVersion.content as ResumeContent,
    job.description,
  );

  const newVersion = await prisma.resumeVersion.create({
    data: {
      resumeId,
      userId: user.id,
      jobId,
      content: tailoredContent,
      versionType: "TAILORED",
    },
  });

  // Calculate ATS score deterministically
  const skillGap = calculateSkillGap(tailoredContent, job.description);

  await prisma.aTSResult.create({
    data: {
      resumeVersionId: newVersion.id,
      score: skillGap.matchPercentage,
      matchedKeywords: skillGap.matchedSkills,
      missingKeywords: skillGap.missingSkills,
      weakKeywords: [],
    },
  });

  const structuredSuggestions = generateSectionSuggestions(
    tailoredContent as StructuredResumeContent,
    skillGap,
  );

  await prisma.aISuggestion.createMany({
    data: structuredSuggestions.map((s) => ({
      resumeVersionId: newVersion.id,
      section: s.section,
      originalContent: s.originalContent,
      suggestedContent: s.suggestedContent,
      applied: false,
    })),
  });

  await prisma.skillGap.deleteMany({
    where: { jobId: job.id },
  });

  const newGaps = skillGap.missingSkills.map((skill) => {
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
          ? "This skill appears multiple times in the job description."
          : "This skill is mentioned in the job description.",
    };
  });

  if (newGaps.length > 0) {
    await prisma.skillGap.createMany({
      data: newGaps,
    });
  }

  // Delete previous InterviewPrep for this job
  await prisma.interviewPrep.deleteMany({
    where: { jobId: job.id },
  });

  let interviewData;

  try {
    interviewData = await generateAIInterviewPrep(
      job.title,
      job.description,
      skillGap.matchedSkills,
    );
  } catch {
    interviewData = generateInterviewPrep(
      job.title,
      job.description,
      skillGap.matchedSkills,
    );
  }

  await prisma.interviewPrep.create({
    data: {
      jobId: job.id,
      type: "FULL", // You can later split into TECHNICAL / BEHAVIORAL
      questions: interviewData.questions,
      starDrafts: interviewData.starDrafts,
      technicalTopics: interviewData.technicalTopics,
    },
  });

  return newVersion;
}


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
  if (!latestVersion) throw new Error("No resume version found");

  const skillGap = await prisma.aTSResult.findFirst({
    where: { resumeVersionId: latestVersion.id },
  });

  let interviewData;

  try {
    interviewData = await generateAIInterviewPrep(
      job.title,
      job.description,
      (skillGap?.matchedKeywords as string[]) ?? [],
    );
  } catch {
    interviewData = generateInterviewPrep(
      job.title,
      job.description,
      (skillGap?.matchedKeywords as string[]) ?? [],
    );
  }

  await prisma.interviewPrep.deleteMany({
    where: { jobId },
  });

  await prisma.interviewPrep.create({
    data: {
      jobId,
      type: "FULL",
      questions: interviewData.questions,
      starDrafts: interviewData.starDrafts,
      technicalTopics: interviewData.technicalTopics,
    },
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
}