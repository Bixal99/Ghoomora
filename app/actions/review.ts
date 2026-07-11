"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingStatus } from "@prisma/client";
import { requireActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function createReview(formData: FormData) {
  const db = getDb();
  const actor = await requireActor();
  if (!db) throw new Error("Database is not configured.");
  const parsed = reviewSchema.parse(Object.fromEntries(formData));
  const booking = await db.booking.findUnique({ where: { id: parsed.bookingId }, include: { review: true } });
  if (!booking || booking.customerId !== actor.id) throw new Error("Booking not found.");
  if (booking.status !== BookingStatus.COMPLETED) throw new Error("Reviews are only allowed after a completed trip.");
  if (booking.review) throw new Error("You have already reviewed this booking.");
  await db.review.create({ data: { bookingId: parsed.bookingId, userId: actor.id, rating: parsed.rating, comment: parsed.comment } });
  revalidatePath("/bookings/" + parsed.bookingId);
}
