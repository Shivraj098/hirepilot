/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db/prisma";

export async function getCachedAI(key: string) {
  return prisma.aICache.findUnique({
    where: { key },
  });
}

export async function saveCachedAI(
  key: string,
  prompt: string,
  result: unknown
) {
  return prisma.aICache.create({
    data: {
      key,
      prompt,
      result: result as any ,
    },
  });
}