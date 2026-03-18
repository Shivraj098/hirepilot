"use server";

import { getDashboardStats } from "./dashboard.stats";
import { getPipelineStats } from "./dashboard.pipeline";
import { getRecentActivity } from "./dashboard.activity";
import { getBestData } from "./dashboard.best";
import { getScoreTrend } from "./dashboard.trend";
import { getInsights } from "./dashboard.insight";

export async function getDashboardData(
  userId: string
) {
  const [
    stats,
    pipeline,
    activity,
    best,
    trend,
    insights,
  ] = await Promise.all([
    getDashboardStats(userId),
    getPipelineStats(userId),
    getRecentActivity(userId),
    getBestData(userId),
    getScoreTrend(userId),
    getInsights(userId),
  ]);

  return {
    stats,
    pipeline,
    activity,
    best,
    trend,
    insights,
  };
}