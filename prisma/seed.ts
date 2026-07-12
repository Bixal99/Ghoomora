import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { destinationSeed, pickupCitySeed, regionSeed } from "./seed-data";

import { resolvePgConnectionString } from "../lib/pg-connection";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed Ghoomora.");
const pool = new Pool({ connectionString: resolvePgConnectionString(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("Skipping admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD to create the admin account.");
    return;
  }
  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin && existingAdmin.email.toLowerCase() !== email) {
    console.log(`A different admin (${existingAdmin.email}) already exists — leaving it untouched.`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash },
    create: { email, name: process.env.ADMIN_NAME || "Ghoomora Admin", role: Role.ADMIN, passwordHash },
  });
  console.log(`Admin account ready: ${email}`);
}

async function main() {
  await seedAdmin();
  const regions = new Map<string, string>();
  for (const region of regionSeed) {
    const saved = await prisma.region.upsert({ where: { slug: region.slug }, update: { name: region.name }, create: { name: region.name, slug: region.slug } });
    regions.set(region.slug, saved.id);
  }
  for (const destination of destinationSeed) {
    const regionId = regions.get(destination.regionSlug);
    if (!regionId) continue;
    const { regionSlug, ...data } = destination;
    void regionSlug;
    await prisma.destination.upsert({ where: { slug: destination.slug }, update: { ...data, regionId }, create: { ...data, regionId } });
  }
  for (const city of pickupCitySeed) await prisma.pickupCity.upsert({ where: { slug: city.slug }, update: city, create: city });
  console.log(`Seeded ${regions.size} regions, ${destinationSeed.length} destinations, ${pickupCitySeed.length} pickup cities.`);
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
