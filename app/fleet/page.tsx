import { AccessPanel } from "@/components/access-panel";
import { FleetForms } from "@/components/fleet-forms";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const localHireTypes = new Set(["WAGON", "LAND_CRUISER", "PRADO", "JEEP"]);

export default async function FleetPage() {
  const actor = await getActor();
  const db = getDb();
  if (!db) return <PortalShell><AccessPanel /></PortalShell>;
  if (!actor) return <PortalShell><AccessPanel redirectTo="/fleet" /></PortalShell>;
  if (!actor.vendor) return <PortalShell><AccessPanel needsOnboarding /></PortalShell>;
  const [vehicles, cities, regions, destinations] = await Promise.all([
    db.vehicle.findMany({ where: { vendorId: actor.vendor.id }, include: { fares: { include: { pickupCity: true, region: true } }, localHireRates: { include: { destination: true } } } }),
    db.pickupCity.findMany({ orderBy: { name: "asc" } }),
    db.region.findMany({ orderBy: { name: "asc" } }),
    db.destination.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pickupVehicles = vehicles.filter((item) => item.type === "COASTER" || item.type === "CAR");
  const localHireVehicles = vehicles.filter((item) => localHireTypes.has(item.type));

  return (
    <PortalShell>
      <p className="eyebrow text-[#5a7f73]">Transport inventory</p>
      <h1 className="display-title mt-2 text-6xl">Fleet & fares</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Pickup-leg fares stay separate from local day-hire. Only supported vehicle and mode combinations are accepted.</p>
      <FleetForms
        vehicles={vehicles.map(({ id, type, seats }) => ({ id, type, seats }))}
        pickupVehicles={pickupVehicles.map(({ id, type, seats }) => ({ id, type, seats }))}
        localHireVehicles={localHireVehicles.map(({ id, type, seats }) => ({ id, type, seats }))}
        cities={cities.map(({ id, name }) => ({ id, name }))}
        regions={regions.map(({ id, name }) => ({ id, name }))}
        destinations={destinations.map(({ id, name }) => ({ id, name }))}
      />
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
