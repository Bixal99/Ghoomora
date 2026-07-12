import { VendorType } from "@prisma/client";
import { createCamp } from "@/app/actions/vendor";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function CampsPage() {
  const actor = await getActor(); const db = getDb();
  if (!db) return <PortalShell><AccessPanel /></PortalShell>;
  if (!actor) return <PortalShell><AccessPanel redirectTo="/camps" /></PortalShell>;
  if (!actor.vendor) return <PortalShell><AccessPanel needsOnboarding /></PortalShell>;
  const enabled = actor.vendor.types.includes(VendorType.CAMP);
  const camps = await db.campSite.findMany({ where: { vendorId: actor.vendor.id } });
  return <PortalShell vendorTypes={actor.vendor.types}><p className="eyebrow text-[#5a7f73]">Outdoor stays</p><h1 className="display-title mt-2 text-6xl">Camps</h1>{enabled ? <Card className="mt-8 p-7"><form action={createCamp} className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Camp name<input name="name" required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Amenities, comma separated<input name="amenities" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Tent capacity<input name="capacityTents" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Price per night<input name="pricePerNight" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><Button className="md:col-span-2">Add camp</Button></form></Card> : <Card className="mt-8 p-7">Add CAMP to your vendor profile before managing camps.</Card>}{enabled && camps.length === 0 ? <Card className="mt-7 p-8 text-center text-sm text-muted-foreground">No camps yet — add your first camp above to start listing outdoor stays.</Card> : null}<div className="mt-7 grid gap-4 md:grid-cols-2">{camps.map((camp) => <Card key={camp.id} className="p-6"><h2 className="text-xl font-extrabold">{camp.name}</h2><p className="mt-3 text-sm text-muted-foreground">{camp.capacityTents} tents · {formatPKR(camp.pricePerNight)} / night</p><p className="mt-2 text-xs">{camp.amenities.join(" · ")}</p></Card>)}</div></PortalShell>;
}
