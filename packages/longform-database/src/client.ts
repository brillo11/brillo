import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = `${process.env.LONGFORM_DATABASE_URL}`;

const pool = new Pool({
  connectionString,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prismaLongform: PrismaClient };

export const prismaLongform =
  globalForPrisma.prismaLongform ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaLongform = prismaLongform;

export * from "../generated/client/client";
