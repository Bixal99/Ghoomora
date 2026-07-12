import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { InnerHeaderShell } from "@/components/inner-header-shell";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?redirect_url=/bookings");
  if (actor.role === Role.ADMIN) redirect("/approvals");

  const db = getDb();
  if (!db) {
    return (
      <>
        <InnerHeaderShell />
        <main className="section-pad min-h-screen bg-[#e5eee9]">
          <div className="container-shell max-w-4xl">
            <EmptyState title="Database unavailable" description="Connect a database to view bookings." />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const bookings =
    actor.role === Role.VENDOR && actor.vendor
      ? await db.booking.findMany({
          where: { package: { vendorId: actor.vendor.id } },
          include: { package: true, pickupCity: true, tier: true, travelers: true },
          orderBy: { travelDate: "desc" },
        })
      : await db.booking.findMany({
          where: { customerId: actor.id },
          include: { package: true, pickupCity: true, tier: true, travelers: true },
          orderBy: { travelDate: "desc" },
        });

  const title = actor.role === Role.VENDOR ? "Vendor bookings" : "My bookings";

  return (
    <>
      <InnerHeaderShell />
      <main className="section-pad min-h-screen bg-[#e5eee9]">
        <div className="container-shell max-w-4xl">
          <p className="eyebrow text-[#5a7f73]">Trips</p>
          <h1 className="display-title mt-2 text-6xl">{title}</h1>

          {bookings.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No bookings yet"
                description={
                  actor.role === Role.VENDOR
                    ? "When travelers book your packages, they will appear here."
                    : "Explore trip plans and book your first journey when you are ready."
                }
                action={
                  actor.role === Role.CUSTOMER ? (
                    <Button asChild><Link href="/trip-builder">Explore Plans</Link></Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Badge>{booking.status}</Badge>
                      <h2 className="mt-3 text-xl font-extrabold">{booking.package.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.selectedDays} days · {booking.travelers.length} travelers · Departs {booking.travelDate.toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.pickupCity.name} · {booking.tier.tier} · {formatPKR(booking.totalPrice)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={"/bookings/" + booking.id}>View details</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
