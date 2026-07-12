import "server-only";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export function authIsConfigured() {
  return Boolean(process.env.AUTH_SECRET && process.env.DATABASE_URL);
}

export async function getActor() {
  const db = getDb();
  if (!db || !authIsConfigured()) return null;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    include: {
      vendor: true,
      vendorApplications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function requireActor(roles?: Role[]) {
  const actor = await getActor();
  if (!actor) throw new Error("Authentication is required.");
  if (roles && !roles.includes(actor.role)) throw new Error("You do not have permission to perform this action.");
  return actor;
}
