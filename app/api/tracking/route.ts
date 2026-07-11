import { z } from "zod";
import { publishBookingLocation } from "@/lib/pusher";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { BookingStatus, Role } from "@prisma/client";

const schema = z.object({
  bookingId: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export async function POST(request: Request) {
  const actor = await getActor();
  if (!actor || (actor.role !== Role.VENDOR && actor.role !== Role.ADMIN)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = schema.parse(await request.json());
    const db = getDb();
    if (!db) return Response.json({ error: "Database unavailable" }, { status: 503 });
    const booking = await db.booking.findUnique({ where: { id: body.bookingId }, include: { package: { include: { vendor: true } } } });
    if (!booking || booking.status !== BookingStatus.IN_PROGRESS) return Response.json({ error: "Booking not in progress" }, { status: 400 });
    if (actor.role === Role.VENDOR && booking.package.vendor.ownerId !== actor.id) return Response.json({ error: "Forbidden" }, { status: 403 });
    const ok = await publishBookingLocation(body.bookingId, body.latitude, body.longitude);
    if (!ok) return Response.json({ error: "Pusher not configured" }, { status: 503 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
