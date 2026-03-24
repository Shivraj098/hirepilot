import { prisma } from "@/lib/db/prisma";
import { AI_LIMIT, AI_WINDOW_MS } from "@/server/config/constants";
import { logError } from "@/server/utils/logger";

export async function checkAIGuard(userId: string): Promise<void> {
  try {
    const windowStart = new Date(Date.now() - AI_WINDOW_MS);

    const recentCount = await prisma.activity.count({
      where: {
        userId,
        type: {
          in: [
            "RESUME_SCORED",
            "RESUME_INTELLIGENCE",
            "JOB_ANALYZED",
            "MATCH_ANALYZED",
            "INTERVIEW_GENERATED",
            "ANALYZE_LINKEDIN",
            "PORTFOLIO_ANALYZED",
          ],
        },
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= AI_LIMIT) {
      throw new Error(
        `AI rate limit exceeded. You can make ${AI_LIMIT} AI requests per minute.`
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("rate limit")) {
      throw err;
    }
    // DB error — fail open, log and continue
    logError("AI Guard check failed", err);
  }
}