import { createFare, createLocalHireRate, createVehicle } from "@/app/actions/vendor";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const actor = await getActor();
  const db = getDb();
  if (!actor?.vendor || !db) return <PortalShell><AccessPanel /></PortalShell>;
  const [vehicles, cities, regions, destinations] = await Promise.all([
    db.vehicle.findMany({ where: { vendorId: actor.vendor.id }, include: { fares: { include: { pickupCity: true, region: true } }, localHireRates: { include: { destination: true } } } }),
    db.pickupCity.findMany({ orderBy: { name: "asc" } }),
    db.region.findMany({ orderBy: { name: "asc" } }),
    db.destination.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pickupVehicles = vehicles.filter((item) => item.type === "COASTER" || item.type === "CAR");
  const localHireVehicles = vehicles.filter((item) => ["WAGON", "LAND_CRUISER", "PRADO", "JEEP"].includes(item.type));

  return (
    <PortalShell>
      <p className="eyebrow text-[#5a7f73]">Transport inventory</p>
      <h1 className="display-title mt-2 text-6xl">Fleet & fares</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Pickup-leg fares stay separate from local day-hire. Only supported vehicle and mode combinations are accepted.</p>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card className="p-7">
          <h2 className="text-xl font-extrabold">Add vehicle</h2>
          <form action={createVehicle} className="mt-5 grid gap-4">
            <label className="text-sm font-bold">Type<select name="type" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{["COASTER", "CAR", "WAGON", "LAND_CRUISER", "PRADO", "JEEP"].map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="text-sm font-bold">Seats<input name="seats" type="number" min={1} max={60} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
            <label className="text-sm font-bold"><input name="ac" type="checkbox" className="mr-2 accent-[#173f35]" />Air-conditioned</label>
            <Button>Add vehicle</Button>
          </form>
        </Card>
        <Card className="p-7">
          <h2 className="text-xl font-extrabold">Set pickup fare</h2>
          <form action={createFare} className="mt-5 grid gap-4">
            <label className="text-sm font-bold">Vehicle<select name="vehicleId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{pickupVehicles.map((item) => <option key={item.id} value={item.id}>{item.type} · {item.seats} seats</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-bold">Pickup city<select name="pickupCityId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-sm font-bold">Region<select name="regionId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </div>
            <label className="text-sm font-bold">Mode<select name="mode" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3"><option>SHARED</option><option>PRIVATE</option></select></label>
            <label className="text-sm font-bold">Fare in PKR<input name="price" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
            <Button disabled={!pickupVehicles.length}>Save fare</Button>
          </form>
        </Card>
        <Card className="p-7">
          <h2 className="text-xl font-extrabold">Set local day-hire</h2>
          <form action={createLocalHireRate} className="mt-5 grid gap-4">
            <label className="text-sm font-bold">4x4 vehicle<select name="vehicleId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{localHireVehicles.map((item) => <option key={item.id} value={item.id}>{item.type} · {item.seats} seats</option>)}</select></label>
            <label className="text-sm font-bold">Destination<select name="destinationId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-sm font-bold">Price per day (PKR)<input name="pricePerDay" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
            <Button disabled={!localHireVehicles.length}>Save local hire rate</Button>
          </form>
        </Card>
      </div>
      <div className="mt-8 grid gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="p-6">
            <div className="flex items-center gap-2"><h3 className="text-lg font-extrabold">{vehicle.type}</h3><Badge>{vehicle.seats} seats</Badge><Badge>{vehicle.ac ? "AC" : "Non-AC"}</Badge></div>
            {vehicle.fares.length > 0 && <div className="mt-4"><p className="text-xs font-bold uppercase text-muted-foreground">Pickup fares</p><div className="mt-2 grid gap-2 text-sm">{vehicle.fares.map((fare) => <div key={fare.id} className="flex justify-between rounded-xl bg-muted p-3"><span>{fare.pickupCity.name} → {fare.region.name} · {fare.mode}</span><strong>{formatPKR(fare.price)}</strong></div>)}</div></div>}
            {vehicle.localHireRates.length > 0 && <div className="mt-4"><p className="text-xs font-bold uppercase text-muted-foreground">Local day-hire</p><div className="mt-2 grid gap-2 text-sm">{vehicle.localHireRates.map((rate) => <div key={rate.id} className="flex justify-between rounded-xl bg-[#fff4dc] p-3"><span>{rate.destination.name}</span><strong>{formatPKR(rate.pricePerDay)}/day</strong></div>)}</div></div>}
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
