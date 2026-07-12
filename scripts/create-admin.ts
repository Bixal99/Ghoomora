import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { resolvePgConnectionString } from "../lib/pg-connection";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to create the admin account.");
}

const pool = new Pool({ connectionString: resolvePgConnectionString(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Ghoomora Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running admin:create.");
    process.exitCode = 1;
    return;
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    console.log(`Admin account already present: ${email} — leaving it untouched.`);
    return;
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin) {
    console.log(`A different admin (${existingAdmin.email}) already exists — leaving it untouched.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name, role: Role.ADMIN, passwordHash, emailVerified: new Date() },
  });
  console.log(`Admin account created: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
