import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaClientSingleton = () => {
  console.log(
  process.env.PRISMA_ACCELERATE_URL?.slice(0, 50)
);
  return new PrismaClient({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  }).$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<
  typeof prismaClientSingleton
>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}