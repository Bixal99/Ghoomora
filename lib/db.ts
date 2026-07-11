import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { resolvePgConnectionString } from "@/lib/pg-connection";

const globalForDb = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool };

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({ connectionString: resolvePgConnectionString(process.env.DATABASE_URL) });
  }
  if (!globalForDb.prisma) globalForDb.prisma = new PrismaClient({ adapter: new PrismaPg(globalForDb.pool) });
  return globalForDb.prisma;
}
