"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApplicationStatus, Role, VendorType } from "@prisma/client";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { uploadVendorDocument } from "@/lib/cloudinary-upload";
import { vendorApplicationSchema } from "@/lib/validation";

function values(formData: FormData, key: string) {
  return formData.getAll(key).map(String);
}

export async function submitVendorApplication(formData: FormData) {
  const db = getDb();
  if (!db) throw new Error("Database is not configured.");
  const actor = await requireActor([Role.CUSTOMER]);

  const openApplication = await db.vendorApplication.findFirst({
    where: { userId: actor.id, status: ApplicationStatus.PENDING },
  });
  if (openApplication) throw new Error("You already have an application under review.");

  const parsed = vendorApplicationSchema.parse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
    cnic: formData.get("cnic"),
    description: formData.get("description"),
    requestedTypes: values(formData, "requestedTypes"),
  });

  const document = formData.get("document");
  let documentUrl: string | undefined;
  if (document instanceof File && document.size > 0) {
    documentUrl = await uploadVendorDocument(document);
  }

  await db.vendorApplication.create({
    data: {
      userId: actor.id,
      businessName: parsed.businessName,
      phone: parsed.phone,
      cnic: parsed.cnic,
      description: parsed.description,
      requestedTypes: parsed.requestedTypes as VendorType[],
      documentUrl,
      status: ApplicationStatus.PENDING,
    },
  });

  revalidatePath("/profile");
  redirect("/profile?notice=Application+submitted+for+review");
}
