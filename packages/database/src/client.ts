import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (!connectionString) {
  // During build time or if env is missing, instantiate without adapter to prevent crash
  prismaInstance = new PrismaClient({} as any);
} else {
  const pool = new Pool({
    connectionString,
  });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/client/client";
