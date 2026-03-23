import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user ?? null;
  } catch {
    return null;
  }
}
