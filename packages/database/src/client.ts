import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://brillo:brillo1212%21%21@pg1101.gabiadb.com:5432/brillo?sslmode=disable";

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prismaInstance = new PrismaClient({ adapter });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "../generated/client/client";
