import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Package, Settings2 } from "lucide-react";
import { updateBookingStatus } from "@/app/actions/booking";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";
import { ApplicationStatus, BookingStatus, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const actor = await getActor();
  if (!actor) return <PortalShell><AccessPanel /></PortalShell>;

  if (actor.role === Role.CUSTOMER) {
    const application = actor.vendorApplications[0];
    if (application?.status === ApplicationStatus.PENDING) {
      return (
        <PortalShell>
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-[#5a7f73]">Partner application</p>
            <h1 className="display-title mt-2 text-6xl">Application under review</h1>
            <Card className="mt-8 p-7">
              <div className="flex items-center gap-2 text-[#805b21]"><Clock3 size={20} /><h2 className="text-xl font-extrabold">{application.businessName}</h2></div>
              <p className="mt-3 leading-7 text-muted-foreground">Your vendor application is with our team. The partner dashboard unlocks as soon as an admin approves it. You can review your application status any time on your profile.</p>
              <Button asChild className="mt-6" variant="outline"><Link href="/profile">View application status</Link></Button>
            </Card>
          </div>
        </PortalShell>
      );
    }
    redirect("/profile");
  }

  if (!actor.vendor) return <PortalShell><AccessPanel needsOnboarding /></PortalShell>;
  const db = getDb();
  const [stats, bookings] = db
    ? await Promise.all([
        Promise.all([db.vehicle.count({ where: { vendorId: actor.vendor.id } }), db.hotel.count({ where: { vendorId: actor.vendor.id } }), db.package.count({ where: { vendorId: actor.vendor.id } })]),
        db.booking.findMany({ where: { package: { vendorId: actor.vendor.id } }, include: { customer: true, package: true, pickupCity: true }, orderBy: { travelDate: "desc" }, take: 10 }),
      ])
    : [[0, 0, 0], []];
  const notice = (await searchParams).notice;
  return (
    <PortalShell>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-[#5a7f73]">Partner overview</p><h1 className="display-title mt-2 text-6xl">{actor.vendor.businessName}</h1></div><Badge className={actor.vendor.verified ? "border-[#397668] bg-[#dff1e9] text-[#23594c]" : "border-[#d19b48] bg-[#fff2d8] text-[#805b21]"}>{actor.vendor.verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{actor.vendor.verified ? "Verified" : "Awaiting approval"}</Badge></div>
      {notice && <div className="mt-6 rounded-xl bg-[#dff1e9] p-4 text-sm font-bold text-[#23594c]">{notice}</div>}
      <div className="mt-8 grid gap-5 md:grid-cols-3">{[{ label: "Vehicles", value: stats[0], icon: Settings2, href: "/fleet" }, { label: "Hotels", value: stats[1], icon: CheckCircle2, href: "/hotels" }, { label: "Packages", value: stats[2], icon: Package, href: "/vendor/packages" }].map((item) => <Card key={item.label} className="p-6"><item.icon className="text-[#397668]" /><p className="mt-8 text-4xl font-extrabold">{item.value}</p><p className="text-sm text-muted-foreground">{item.label}</p><Link href={item.href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#397668]">Manage <ArrowRight size={15} /></Link></Card>)}</div>
      <Card className="mt-8 p-7">
        <h2 className="text-xl font-extrabold">Recent bookings</h2>
        {bookings.length ? (
          <div className="mt-5 space-y-4">{bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-extrabold">{booking.package.title}</p><p className="text-sm text-muted-foreground">{booking.customer.name} · {booking.pickupCity.name} · {formatPKR(booking.totalPrice)}</p></div><Badge>{booking.status}</Badge></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline"><Link href={"/bookings/" + booking.id}>View</Link></Button>
                {booking.status === BookingStatus.PENDING && <form action={updateBookingStatus}><input type="hidden" name="bookingId" value={booking.id} /><input type="hidden" name="status" value={BookingStatus.CONFIRMED} /><Button size="sm" type="submit">Confirm</Button></form>}
              </div>
            </div>
          ))}</div>
        ) : <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>}
      </Card>
    </PortalShell>
  );
}
