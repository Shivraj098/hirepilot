import { getDashboardStats } from "./dashboard.stats";
import { getPipelineStats } from "./dashboard.pipeline";
import { getRecentActivity } from "./dashboard.activity";
import { getBestData } from "./dashboard.best";
import { getScoreTrend } from "./dashboard.trend";
import { getInsights } from "./dashboard.insight";

export type DashboardData = {
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  pipeline: Awaited<ReturnType<typeof getPipelineStats>>;
  activity: Awaited<ReturnType<typeof getRecentActivity>>;
  best: Awaited<ReturnType<typeof getBestData>>;
  trend: Awaited<ReturnType<typeof getScoreTrend>>;
  insights: Awaited<ReturnType<typeof getInsights>>;
};

export async function getDashboardData(
  userId: string
): Promise<DashboardData> {
  const [stats, pipeline, activity, best, trend, insights] =
    await Promise.allSettled([
      getDashboardStats(userId),
      getPipelineStats(userId),
      getRecentActivity(userId),
      getBestData(userId),
      getScoreTrend(userId),
      getInsights(userId),
    ]);

  return {
    stats:
      stats.status === "fulfilled"
        ? stats.value
        : { resumeCount: 0, jobCount: 0, applicationCount: 0, versionCount: 0, avgScore: 0 },
    pipeline:
      pipeline.status === "fulfilled"
        ? pipeline.value
        : { SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 },
    activity:
      activity.status === "fulfilled" ? activity.value : [],
    best:
      best.status === "fulfilled"
        ? best.value
        : { bestResume: null, bestMatch: null },
    trend:
      trend.status === "fulfilled" ? trend.value : [],
    insights:
      insights.status === "fulfilled"
        ? insights.value
        : { latestAnalysis: null, latestJob: null },
  };
}