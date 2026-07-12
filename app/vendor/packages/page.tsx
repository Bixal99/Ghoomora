import { VendorType } from "@prisma/client";
import { AccessPanel } from "@/components/access-panel";
import { CreatePackageForm } from "@/components/create-package-form";
import { EmptyState } from "@/components/empty-state";
import { PackageStopEditor } from "@/components/package-stop-editor";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
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

  const vendorTypes = actor.vendor.types;
  const canCreatePackages = vendorTypes.includes(VendorType.TRANSPORT);

  const [packages, destinations] = await Promise.all([
    db.package.findMany({ where: { vendorId: actor.vendor.id }, include: { tiers: true, stops: { include: { destination: true }, orderBy: { dayNumber: "asc" } } } }),
    db.destination.findMany({ include: { region: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <PortalShell vendorTypes={vendorTypes}>
      <p className="eyebrow text-[#5a7f73]">Trip products</p>
      <h1 className="display-title mt-2 text-6xl">Packages</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Package products combine transport tiers with your itinerary. Transport vendors can create and manage tours here.</p>

      {!canCreatePackages ? (
        <Card className="mt-8 p-7">Add TRANSPORT to your vendor profile before creating trip packages.</Card>
      ) : (
        <Card className="mt-8 p-7">
          <h2 className="text-xl font-extrabold">Create complete package structure</h2>
          <CreatePackageForm destinations={destinations.map((item) => ({ id: item.id, name: item.name, regionName: item.region.name }))} />
        </Card>
      )}

      {packages.length === 0 && canCreatePackages ? (
        <div className="mt-7">
          <EmptyState title="No packages yet" description="Create your first tour package to appear in the traveler catalog." />
        </div>
      ) : (
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
      )}
    </PortalShell>
  );
}
