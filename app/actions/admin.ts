"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function setVendorApproval(formData: FormData) {
  const db = getDb(); await requireActor([Role.ADMIN]);
  if (!db) throw new Error("Database is not configured.");
  const vendorId = String(formData.get("vendorId") ?? "");
  const verified = formData.get("verified") === "true";
  await db.vendor.update({ where: { id: vendorId }, data: { verified } });
  revalidatePath("/approvals"); revalidatePath("/packages");
}
