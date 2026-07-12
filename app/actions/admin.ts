"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatus, Role, VendorType } from "@prisma/client";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function approveVendorApplication(formData: FormData) {
  const db = getDb();
  const admin = await requireActor([Role.ADMIN]);
  if (!db) throw new Error("Database is not configured.");
  const applicationId = String(formData.get("applicationId") ?? "");

  const application = await db.vendorApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error("Application not found.");
  if (application.status !== ApplicationStatus.PENDING) throw new Error("This application has already been reviewed.");

  await db.$transaction(async (tx) => {
    await tx.vendorApplication.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.APPROVED, reviewedById: admin.id, reviewedAt: new Date(), rejectionNote: null },
    });
    await tx.vendor.upsert({
      where: { ownerId: application.userId },
      update: {
        businessName: application.businessName,
        contactPhone: application.phone,
        description: application.description,
        types: application.requestedTypes as VendorType[],
        verified: true,
      },
      create: {
        ownerId: application.userId,
        businessName: application.businessName,
        contactPhone: application.phone,
        description: application.description,
        types: application.requestedTypes as VendorType[],
        verified: true,
      },
    });
    await tx.user.update({ where: { id: application.userId }, data: { role: Role.VENDOR } });
  });

  revalidatePath("/approvals");
  revalidatePath("/packages");
}

export async function rejectVendorApplication(formData: FormData) {
  const db = getDb();
  const admin = await requireActor([Role.ADMIN]);
  if (!db) throw new Error("Database is not configured.");
  const applicationId = String(formData.get("applicationId") ?? "");
  const rejectionNote = String(formData.get("rejectionNote") ?? "").trim() || null;

  const application = await db.vendorApplication.findUnique({ where: { id: applicationId } });
  if (!application) throw new Error("Application not found.");
  if (application.status !== ApplicationStatus.PENDING) throw new Error("This application has already been reviewed.");

  await db.vendorApplication.update({
    where: { id: application.id },
    data: { status: ApplicationStatus.REJECTED, rejectionNote, reviewedById: admin.id, reviewedAt: new Date() },
  });

  revalidatePath("/approvals");
}
