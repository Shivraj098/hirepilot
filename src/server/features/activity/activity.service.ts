import { prisma } from "@/lib/db/prisma";
import { ActivityType } from "@prisma/client";
import { logError } from "@/server/utils/logger";

export function logActivity(data: {
  userId: string;
  type: ActivityType;
  message?: string;
  entityType?: string;
  entityId?: string;
}) {
  // Fire and forget — never blocks the calling action
  prisma.activity
    .create({ data })
    .catch((err) => logError("Activity log failed", err));
}