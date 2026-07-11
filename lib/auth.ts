import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { getDb } from "@/lib/db";

export function authIsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
}

async function syncClerkUser(clerkId: string) {
  const db = getDb();
  if (!db) return null;
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) return null;

  const email =
    clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email;
  const role = adminEmails().includes(email.toLowerCase()) ? Role.ADMIN : Role.CUSTOMER;

  return db.user.upsert({
    where: { clerkId },
    update: { email, name, ...(adminEmails().includes(email.toLowerCase()) ? { role: Role.ADMIN } : {}) },
    create: { clerkId, email, name, role },
    include: { vendor: true },
  });
}

export async function getActor() {
  const db = getDb();
  if (!db || !authIsConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({ where: { clerkId: userId }, include: { vendor: true } });
  if (existing) return existing;

  // Webhooks cannot reach localhost — sync the Clerk profile on first sign-in/sign-up.
  return syncClerkUser(userId);
}

export async function requireActor(roles?: Role[]) {
  const actor = await getActor();
  if (!actor) throw new Error("Authentication is required.");
  if (roles && !roles.includes(actor.role)) throw new Error("You do not have permission to perform this action.");
  return actor;
}
