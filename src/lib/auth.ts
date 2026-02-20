import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function getCurrentUser() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) return null;

  return session.user;
}