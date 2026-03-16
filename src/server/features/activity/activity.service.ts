"use server";

import { prisma } from "@/lib/db/prisma";

export async function logActivity(data: {
  userId: string;
  type: string;
  message?: string;
  entityType?: string;
  entityId?: string;
}) {
  return prisma.activity.create({
    data,
  });
}