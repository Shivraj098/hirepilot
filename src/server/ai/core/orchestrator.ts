import { aiJsonCompletion } from "./client";
import { hashPrompt } from "./hash";
import { getCachedAI, saveCachedAI } from "./ai-cache";
import { logError } from "@/server/utils/logger";

export async function runAI<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    userId?: string;
    ttlHours?: number;
    skipCache?: boolean;
  }
): Promise<T | null> {
  // User-scoped cache key prevents cross-user cache hits
  const cacheInput = options?.userId
    ? `${options.userId}:${systemPrompt}:${userPrompt}`
    : `${systemPrompt}:${userPrompt}`;

  const key = hashPrompt(cacheInput);

  if (!options?.skipCache) {
    const cached = await getCachedAI(key);
    if (cached) {
      return cached.result as T;
    }
  }

  try {
    const result = await aiJsonCompletion<T>(
      systemPrompt,
      userPrompt,
      { temperature: options?.temperature ?? 0.2 }
    );

    if (result) {
      await saveCachedAI(
        key,
        userPrompt,
        result,
        options?.ttlHours
      );
    }

    return result;
  } catch (err) {
    logError("runAI failed", err);
    return null;
  }
}