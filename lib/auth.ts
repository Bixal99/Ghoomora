import "server-only";
import { auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { getDb } from "@/lib/db";

export function authIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getActor() {
  const db = getDb();
  if (!db || !authIsConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId }, include: { vendor: true } });
}

export async function requireActor(roles?: Role[]) {
  const actor = await getActor();
  if (!actor) throw new Error("Authentication is required.");
  if (roles && !roles.includes(actor.role)) throw new Error("You do not have permission to perform this action.");
  return actor;
}
