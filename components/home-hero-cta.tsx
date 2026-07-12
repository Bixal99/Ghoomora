import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLandingCta } from "@/lib/navigation";

export async function HomeHeroCta() {
  const actor = await getActor();
  const db = getDb();
  let bookingCount = 0;

  if (actor && actor.role === Role.CUSTOMER && db) {
    bookingCount = await db.booking.count({ where: { customerId: actor.id } });
  }

  const cta = getLandingCta(actor, bookingCount);

  return (
    <div className="mt-9 flex flex-wrap gap-3">
      <Button asChild size="lg" variant="accent">
        <Link href={cta.primary.href}>
          {cta.primary.label} <ArrowRight size={18} />
        </Link>
      </Button>
      {cta.secondary && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
        >
          <Link href={cta.secondary.href}>{cta.secondary.label}</Link>
        </Button>
      )}
    </div>
  );
}
