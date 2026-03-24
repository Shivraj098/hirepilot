import { runAI } from "@/server/ai/core/orchestrator";
import { JobIntelligence } from "@/server/types/ai.types";

const SYSTEM_PROMPT = `You are an expert job market analyst with deep knowledge of 
tech industry roles, required skills, and career levels.

You analyze job descriptions to extract structured insights that help candidates 
understand role requirements and assess their fit.
You always respond with valid JSON only.`;

export async function analyzeJob(
  jobDescription: string,
  userId?: string
): Promise<JobIntelligence | null> {
  if (!jobDescription || jobDescription.trim().length < 50) {
    return null;
  }

  const userPrompt = `Analyze this job description and extract structured insights.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return this exact JSON structure:
{
  "roleCategory": <specific role category e.g. "Frontend Engineer", "ML Engineer", "Product Manager">,
  "requiredLevel": <"Intern" | "Junior" | "Mid" | "Senior" | "Lead" | "Staff" | "Principal">,
  "difficulty": <"Easy" | "Medium" | "Hard"> based on skill requirements and competition,
  "domain": <"Web" | "Backend" | "AI/ML" | "DevOps" | "Data" | "Mobile" | "Security" | "Full-Stack" | "Other">,
  "importantSkills": [<8-12 most critical skills explicitly required>],
  "secondarySkills": [<5-8 nice-to-have or implied skills>],
  "salaryIndicator": <"Entry" | "Mid" | "Senior" | "Executive"> based on requirements,
  "remoteType": <"Remote" | "Hybrid" | "On-site" | "Unknown">,
  "keyResponsibilities": [<3-5 main responsibilities extracted from description>]
}

RULES:
- importantSkills must only include skills explicitly mentioned in the job description
- requiredLevel based on years of experience required and complexity of role
- difficulty Hard means 5+ years required OR very specialized tech stack`;

  return runAI<JobIntelligence>(SYSTEM_PROMPT, userPrompt, {
    temperature: 0.1,
    userId,
    ttlHours: 48,
  });
}