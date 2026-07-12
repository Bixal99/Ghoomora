import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Map, Package, Route, UserRound } from "lucide-react";
import { Role } from "@prisma/client";
import { InnerHeaderShell } from "@/components/inner-header-shell";
import { SiteFooter } from "@/components/site-footer";
import { EmptyState } from "@/components/empty-state";
import { WelcomeToast } from "@/components/welcome-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const quickActions = [
  { href: "/packages", label: "Packages", text: "Browse trip packages from verified operators.", icon: Package },
  { href: "/trip-builder", label: "Trip builder", text: "Shape a journey around destinations and timing.", icon: Route },
  { href: "/bookings", label: "All bookings", text: "See every booking and trip detail in one place.", icon: Map },
  { href: "/profile", label: "Profile", text: "Update your details and account preferences.", icon: UserRound },
] as const;

export default async function TravelerHomePage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?redirect_url=/home");
  if (actor.role === Role.VENDOR) redirect("/dashboard");
  if (actor.role === Role.ADMIN) redirect("/approvals");

  const db = getDb();
  const bookings = db
    ? await db.booking.findMany({
        where: { customerId: actor.id },
        include: { package: true, pickupCity: true, tier: true, travelers: true },
        orderBy: { travelDate: "desc" },
        take: 5,
      })
    : [];

  return (
    <>
      <WelcomeToast />
      <InnerHeaderShell />
      <main className="section-pad min-h-screen bg-[#e5eee9]">
        <div className="container-shell max-w-5xl">
          <p className="eyebrow text-[#5a7f73]">Traveler home</p>
          <h1 className="display-title mt-2 text-6xl">Welcome back, {actor.name}</h1>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl font-extrabold">Recent bookings</h2>
              {bookings.length > 0 ? (
                <Link href="/bookings" className="focus-ring inline-flex items-center gap-1 text-sm font-bold text-[#397668]">
                  View all <ArrowRight size={15} />
                </Link>
              ) : null}
            </div>

            {!db ? (
              <div className="mt-6">
                <EmptyState title="Database unavailable" description="Connect a database to view bookings." />
              </div>
            ) : bookings.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No bookings yet"
                  description="Explore trip plans and book your first journey when you are ready."
                  action={
                    <Button asChild>
                      <Link href="/trip-builder">Open trip builder</Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <Badge>{booking.status}</Badge>
                        <h3 className="mt-3 text-xl font-extrabold">{booking.package.title}</h3>
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
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-extrabold">Quick actions</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Card key={action.href} className="flex h-full min-h-48 flex-col p-6">
                  <action.icon className="text-[#397668]" />
                  <h3 className="mt-6 text-lg font-extrabold">{action.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{action.text}</p>
                  <Link href={action.href} className="focus-ring mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#397668]">
                    Open <ArrowRight size={15} />
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
