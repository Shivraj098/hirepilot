// db.types.ts

import { prisma } from "@/lib/db/prisma";

export type TxClient =
  Parameters<
    Parameters<typeof prisma.$transaction>[0]
  >[0];