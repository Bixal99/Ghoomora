import { notFound } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { resolveBookingPrice } from "@/lib/pricing";
import { renderVoucherPdf } from "@/lib/voucher-pdf";
import { getActor } from "@/lib/auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) return new Response("Unauthorized", { status: 401 });
  const db = getDb();
  if (!db) return new Response("Database unavailable", { status: 503 });
  const booking = await db.booking.findUnique({
    where: { id: (await context.params).id },
    include: { pickupCity: true, tier: true, travelers: true, package: { include: { vendor: true } } },
  });
  if (!booking || booking.customerId !== actor.id) notFound();
  const voucherStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED];
  if (!voucherStatuses.includes(booking.status)) {
    return new Response("Voucher not available for this booking status", { status: 403 });
  }
  const price = await resolveBookingPrice({
    packageId: booking.packageId,
    tierId: booking.tierId,
    pickupCitySlug: booking.pickupCity.slug,
    selectedDays: booking.selectedDays,
    travelerCount: booking.travelers.length,
  });
  const pdf = await renderVoucherPdf({
    bookingId: booking.id,
    packageTitle: booking.package.title,
    vendorName: booking.package.vendor.businessName,
    pickupCity: booking.pickupCity.name,
    tier: booking.tier.tier,
    travelDate: booking.travelDate.toLocaleDateString(),
    travelers: booking.travelers.map((item) => item.name),
    pickupFare: price.pickupFare,
    stayAndExtras: price.stayAndExtras,
    localTransport: price.localTransport,
    total: booking.totalPrice,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ghoomora-voucher-' + booking.id + '.pdf"',
    },
  });
}
