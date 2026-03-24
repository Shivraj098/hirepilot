import { prisma } from "@/lib/db/prisma";
import { logError } from "@/server/utils/logger";

const DEFAULT_TTL_HOURS = 24;

export async function getCachedAI(
  key: string
): Promise<{ result: unknown } | null> {
  try {
    const cached = await prisma.aICache.findUnique({
      where: { key },
      select: { result: true, expiresAt: true },
    });

    if (!cached) return null;

    // Check TTL
    if (new Date() > cached.expiresAt) {
      // Delete expired entry in background
      prisma.aICache
        .delete({ where: { key } })
        .catch(() => {});
      return null;
    }

    return { result: cached.result };
  } catch (err) {
    logError("AI Cache read failed", err);
    return null;
  }
}

export async function saveCachedAI(
  key: string,
  prompt: string,
  result: unknown,
  ttlHours = DEFAULT_TTL_HOURS
): Promise<void> {
  try {
    const expiresAt = new Date(
      Date.now() + ttlHours * 60 * 60 * 1000
    );

    await prisma.aICache.upsert({
      where: { key },
      update: {
        result: result as never,
        prompt,
        expiresAt,
      },
      create: {
        key,
        prompt,
        result: result as never,
        expiresAt,
      },
    });
  } catch (err) {
    logError("AI Cache write failed", err);
    // Cache write failure never blocks the caller
  }
}