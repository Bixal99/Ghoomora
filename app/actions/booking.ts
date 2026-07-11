"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BookingStatus, Role } from "@prisma/client";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { resolveBookingPrice } from "@/lib/pricing";

const travelerSchema = z.object({ name: z.string().trim().min(2), idNumber: z.string().trim().optional(), phone: z.string().trim().optional() });

const bookingSchema = z.object({
  packageId: z.string().min(1),
  tierId: z.string().min(1),
  pickupCitySlug: z.string().min(1),
  selectedDays: z.coerce.number().int().positive(),
  travelerCount: z.coerce.number().int().min(1).max(30),
  travelDate: z.string().min(1),
  travelers: z.array(travelerSchema).min(1),
});

function awardGamification(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: string) {
  return db.user.findUnique({ where: { id: userId } }).then(async (user) => {
    if (!user) return;
    const completedTripsCount = user.completedTripsCount + 1;
    const travelerLevel = completedTripsCount >= 10 ? "LEGEND" : completedTripsCount >= 3 ? "MOUNTAIN_GOAT" : "EXPLORER";
    const badges = new Set(user.badges);
    if (completedTripsCount >= 1) badges.add("first-journey");
    if (completedTripsCount >= 3) badges.add("mountain-goat");
    if (completedTripsCount >= 10) badges.add("legend");
    await db.user.update({ where: { id: userId }, data: { completedTripsCount, travelerLevel, badges: Array.from(badges) } });
  });
}

export async function createBooking(formData: FormData) {
  const db = getDb();
  const actor = await requireActor([Role.CUSTOMER, Role.VENDOR, Role.ADMIN]);
  if (!db) throw new Error("Database is not configured.");

  const travelersRaw = String(formData.get("travelersJson") ?? "[]");
  const parsed = bookingSchema.parse({
    packageId: formData.get("packageId"),
    tierId: formData.get("tierId"),
    pickupCitySlug: formData.get("pickupCitySlug"),
    selectedDays: formData.get("selectedDays"),
    travelerCount: formData.get("travelerCount"),
    travelDate: formData.get("travelDate"),
    travelers: JSON.parse(travelersRaw),
  });

  const price = await resolveBookingPrice({
    packageId: parsed.packageId,
    tierId: parsed.tierId,
    pickupCitySlug: parsed.pickupCitySlug,
    selectedDays: parsed.selectedDays,
    travelerCount: parsed.travelerCount,
  });
  if (!price.canCheckout) throw new Error("Cannot complete checkout — missing local hire rates for this itinerary.");

  const pickupCity = await db.pickupCity.findFirstOrThrow({ where: { slug: parsed.pickupCitySlug } });
  const booking = await db.booking.create({
    data: {
      customerId: actor.id,
      packageId: parsed.packageId,
      tierId: parsed.tierId,
      pickupCityId: pickupCity.id,
      selectedDays: parsed.selectedDays,
      travelDate: new Date(parsed.travelDate),
      totalPrice: price.total,
      travelers: { create: parsed.travelers },
    },
  });

  redirect("/bookings/" + booking.id);
}

export async function updateBookingStatus(formData: FormData) {
  const db = getDb();
  const actor = await requireActor([Role.VENDOR, Role.ADMIN]);
  if (!db) throw new Error("Database is not configured.");
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!Object.values(BookingStatus).includes(status)) throw new Error("Invalid status.");

  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { package: { include: { vendor: true } } } });
  if (!booking) throw new Error("Booking not found.");
  if (actor.role === Role.VENDOR && booking.package.vendor.ownerId !== actor.id) throw new Error("Not authorized.");

  await db.booking.update({ where: { id: bookingId }, data: { status } });
  if (status === BookingStatus.COMPLETED) await awardGamification(db, booking.customerId);
  revalidatePath("/dashboard");
  revalidatePath("/bookings/" + bookingId);
}

export async function cancelBooking(formData: FormData) {
  const db = getDb();
  const actor = await requireActor();
  if (!db) throw new Error("Database is not configured.");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.customerId !== actor.id) throw new Error("Booking not found.");
  if (booking.status === BookingStatus.COMPLETED) throw new Error("Completed bookings cannot be cancelled.");
  await db.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.CANCELLED } });
  revalidatePath("/bookings/" + bookingId);
  redirect("/bookings/" + bookingId);
}
