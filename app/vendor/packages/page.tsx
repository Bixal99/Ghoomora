import { createPackage } from "@/app/actions/vendor";
import { AccessPanel } from "@/components/access-panel";
import { PackageStopEditor } from "@/components/package-stop-editor";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VendorPackagesPage() {
  const actor = await getActor();
  const db = getDb();
  if (!db) return <PortalShell><AccessPanel /></PortalShell>;
  if (!actor) return <PortalShell><AccessPanel redirectTo="/vendor/packages" /></PortalShell>;
  if (!actor.vendor) return <PortalShell><AccessPanel needsOnboarding /></PortalShell>;
  const [packages, destinations] = await Promise.all([
    db.package.findMany({ where: { vendorId: actor.vendor.id }, include: { tiers: true, stops: { include: { destination: true }, orderBy: { dayNumber: "asc" } } } }),
    db.destination.findMany({ include: { region: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <PortalShell>
      <p className="eyebrow text-[#5a7f73]">Trip products</p>
      <h1 className="display-title mt-2 text-6xl">Packages</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Every package starts with all three tiers and a valid day range. Add more stops after the initial structure is saved.</p>
      <Card className="mt-8 p-7">
        <h2 className="text-xl font-extrabold">Create complete package structure</h2>
        <form action={createPackage} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">Title<input name="title" required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
          <label className="text-sm font-bold">First destination<select name="destinationId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{destinations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.region.name}</option>)}</select></label>
          <label className="text-sm font-bold md:col-span-2">Description<textarea name="description" minLength={20} required rows={3} className="focus-ring mt-2 w-full rounded-xl border bg-white p-3" /></label>
          <label className="text-sm font-bold">Minimum days<input name="minDays" type="number" min={2} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
          <label className="text-sm font-bold">Maximum days<input name="maxDays" type="number" min={2} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
          {[["standardRate", "Standard daily rate"], ["moderateRate", "Moderate daily rate"], ["luxuryRate", "Luxury daily rate"]].map(([name, label]) => (
            <label key={name} className="text-sm font-bold">{label}<input name={name} type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
          ))}
          <Button className="md:col-span-2">Create package</Button>
        </form>
      </Card>
      <div className="mt-7 grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="p-6">
            <div className="flex flex-wrap gap-2"><Badge>{pkg.minDays}–{pkg.maxDays} days</Badge>{pkg.tiers.map((tier) => <Badge key={tier.id}>{tier.tier}</Badge>)}</div>
            <h2 className="mt-4 text-xl font-extrabold">{pkg.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{pkg.stops.map((stop) => stop.destination.name).join(" → ")}</p>
            <PackageStopEditor packageId={pkg.id} stops={pkg.stops.map((stop) => ({ destinationId: stop.destinationId, dayNumber: stop.dayNumber, stopType: stop.stopType }))} destinations={destinations.map((item) => ({ id: item.id, name: item.name }))} />
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
