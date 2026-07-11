import { VendorType } from "@prisma/client";
import { createHotel } from "@/app/actions/vendor";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function HotelsPage() {
  const actor = await getActor(); const db = getDb();
  if (!actor?.vendor || !db) return <PortalShell><AccessPanel /></PortalShell>;
  const enabled = actor.vendor.types.includes(VendorType.HOTEL);
  const [hotels, destinations] = await Promise.all([db.hotel.findMany({ where: { vendorId: actor.vendor.id }, include: { destination: { include: { region: true } }, rooms: true } }), db.destination.findMany({ include: { region: true }, orderBy: { name: "asc" } })]);
  return <PortalShell><p className="eyebrow text-[#5a7f73]">Accommodation</p><h1 className="display-title mt-2 text-6xl">Hotels & rooms</h1>{enabled ? <Card className="mt-8 p-7"><h2 className="text-xl font-extrabold">Add a hotel with its first room</h2><form action={createHotel} className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Hotel name<input name="name" required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Destination<select name="destinationId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{destinations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.region.name}</option>)}</select></label><label className="text-sm font-bold">Tier<select name="tier" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3"><option>BUDGET</option><option>MID</option><option>LUXURY</option></select></label><label className="text-sm font-bold">Room type<input name="roomType" defaultValue="Standard" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Capacity<input name="capacity" type="number" min={1} defaultValue={2} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Price per night<input name="pricePerNight" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><Button className="md:col-span-2">Add hotel</Button></form></Card> : <Card className="mt-8 p-7">Add HOTEL to your vendor profile before managing accommodation.</Card>}<div className="mt-7 grid gap-4 md:grid-cols-2">{hotels.map((hotel) => <Card key={hotel.id} className="p-6"><div className="flex gap-2"><Badge>{hotel.tier}</Badge><Badge>{hotel.destination.name}</Badge></div><h2 className="mt-4 text-xl font-extrabold">{hotel.name}</h2>{hotel.rooms.map((room) => <p key={room.id} className="mt-3 text-sm text-muted-foreground">{room.type} · {room.capacity} guests · {formatPKR(room.pricePerNight)}</p>)}</Card>)}</div></PortalShell>;
}
