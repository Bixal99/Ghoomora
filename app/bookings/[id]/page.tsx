import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, Star } from "lucide-react";
import { cancelBooking, updateBookingStatus } from "@/app/actions/booking";
import { createReview } from "@/app/actions/review";
import { LiveTrackingMap } from "@/components/live-tracking";
import { InnerHeader } from "@/components/inner-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { BookingStatus, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/sign-in");
  const db = getDb();
  if (!db) notFound();
  const booking = await db.booking.findUnique({
    where: { id: (await params).id },
    include: {
      customer: true,
      pickupCity: true,
      tier: true,
      travelers: true,
      review: true,
      package: { include: { vendor: true, stops: { include: { destination: true }, orderBy: { dayNumber: "asc" } } } },
    },
  });
  if (!booking) notFound();
  const isOwner = booking.customerId === actor.id;
  const isVendor = actor.vendor && booking.package.vendor.ownerId === actor.id;
  const isAdmin = actor.role === Role.ADMIN;
  if (!isOwner && !isVendor && !isAdmin) notFound();

  return (
    <>
      <InnerHeader />
      <main className="section-pad min-h-screen bg-[#e5eee9]">
        <div className="container-shell max-w-4xl">
          <Badge>{booking.status}</Badge>
          <h1 className="display-title mt-4 text-5xl">{booking.package.title}</h1>
          <p className="mt-3 text-muted-foreground">{booking.selectedDays} days · {booking.travelers.length} travelers · Departs {booking.travelDate.toLocaleDateString()}</p>
          <Card className="mt-8 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-sm text-muted-foreground">Total paid estimate</p><p className="text-3xl font-extrabold">{formatPKR(booking.totalPrice)}</p></div>
              <Button asChild variant="outline"><Link href={"/api/bookings/" + booking.id + "/voucher"}><Download size={16} /> Download e-voucher</Link></Button>
            </div>
            <div className="mt-6 grid gap-2 text-sm"><p>Pickup: {booking.pickupCity.name}</p><p>Tier: {booking.tier.tier}</p><p>Operator: {booking.package.vendor.businessName}</p></div>
          </Card>
          <Card className="mt-6 p-7">
            <h2 className="text-xl font-extrabold">Travelers</h2>
            <ul className="mt-4 space-y-2 text-sm">{booking.travelers.map((traveler) => <li key={traveler.id}>{traveler.name}{traveler.idNumber ? " · " + traveler.idNumber : ""}</li>)}</ul>
          </Card>
          {(isVendor || isAdmin) && booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED && (
            <Card className="mt-6 p-7">
              <h2 className="text-xl font-extrabold">Update status</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED].map((status) => (
                  <form key={status} action={updateBookingStatus}><input type="hidden" name="bookingId" value={booking.id} /><input type="hidden" name="status" value={status} /><Button type="submit" variant="outline" size="sm">{status.replace("_", " ")}</Button></form>
                ))}
              </div>
            </Card>
          )}
          {isOwner && booking.status === BookingStatus.PENDING && (
            <form action={cancelBooking} className="mt-6"><input type="hidden" name="bookingId" value={booking.id} /><Button variant="outline">Cancel booking</Button></form>
          )}
          {isOwner && booking.status === BookingStatus.COMPLETED && !booking.review && (
            <Card className="mt-6 p-7">
              <h2 className="flex items-center gap-2 text-xl font-extrabold"><Star size={18} /> Leave a review</h2>
              <form action={createReview} className="mt-4 grid gap-4">
                <input type="hidden" name="bookingId" value={booking.id} />
                <label className="text-sm font-bold">Rating<select name="rating" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label>
                <label className="text-sm font-bold">Comment<textarea name="comment" rows={3} className="focus-ring mt-2 w-full rounded-xl border bg-white p-3" /></label>
                <Button type="submit">Submit review</Button>
              </form>
            </Card>
          )}
          {booking.review && <Card className="mt-6 p-7"><h2 className="text-xl font-extrabold">Your review</h2><p className="mt-2">{booking.review.rating} / 5</p><p className="mt-2 text-sm text-muted-foreground">{booking.review.comment}</p></Card>}
          <LiveTrackingMap bookingId={booking.id} enabled={booking.status === BookingStatus.IN_PROGRESS} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
