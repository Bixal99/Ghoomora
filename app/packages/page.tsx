import Link from "next/link";
import { ArrowRight, Filter, Route } from "lucide-react";
import { CatalogSetupPanel } from "@/components/catalog-setup-panel";
import { EmptyState } from "@/components/empty-state";
import { InnerHeaderShell } from "@/components/inner-header-shell";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadPackages, loadRegions } from "@/lib/data";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PackagesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const region = typeof params.region === "string" ? params.region : "";
  const tier = typeof params.tier === "string" ? params.tier.toUpperCase() : "";
  const maxDays = typeof params.maxDays === "string" ? Number(params.maxDays) : 0;
  const local = params.local === "true";
  const [packagesLoad, regionsLoad] = await Promise.all([loadPackages(), loadRegions()]);

  if (packagesLoad.status === "setup" || regionsLoad.status === "setup") {
    return (
      <>
        <InnerHeaderShell />
        <main><CatalogSetupPanel /></main>
        <SiteFooter />
      </>
    );
  }

  const allPackages = packagesLoad.data;
  const regions = regionsLoad.data;
  const packages = allPackages.filter((pkg) =>
    (!region || pkg.stops.some((stop) => stop.destination.region.slug === region)) &&
    (!tier || pkg.tiers.some((item) => item.tier === tier)) &&
    (!maxDays || pkg.minDays <= maxDays) &&
    (!local || pkg.stops.some((stop) => stop.destination.requiresLocalTransport))
  );

  return (
    <>
      <InnerHeaderShell />
      <main>
        <section className="bg-[#13382f] py-20 text-white"><div className="container-shell"><p className="eyebrow text-accent">Verified operators only</p><h1 className="display-title mt-3 text-6xl md:text-8xl">Trips with the details intact.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Compare duration, tier pricing and transport requirements before booking is ever part of the conversation.</p></div></section>
        <section className="section-pad"><div className="container-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside><form className="sticky top-5 rounded-[1.5rem] border bg-card p-6"><h2 className="flex items-center gap-2 font-extrabold"><Filter size={18} /> Filter trips</h2><label className="mt-6 block text-sm font-bold">Region<select name="region" defaultValue={region} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3"><option value="">All regions</option>{regions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label className="mt-4 block text-sm font-bold">Tier<select name="tier" defaultValue={tier} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3"><option value="">Any tier</option><option>STANDARD</option><option>MODERATE</option><option>LUXURY</option></select></label><label className="mt-4 block text-sm font-bold">Maximum days<input name="maxDays" defaultValue={maxDays || ""} min={1} max={30} type="number" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="mt-5 flex items-center gap-2 text-sm font-bold"><input name="local" value="true" defaultChecked={local} type="checkbox" className="size-4 accent-[#173f35]" /> Includes local 4x4</label><Button className="mt-6 w-full">Apply filters</Button></form></aside>
          <div>
            <div className="mb-6 flex items-end justify-between"><div><p className="eyebrow text-[#5a7f73]">Verified catalogue</p><h2 className="display-title mt-2 text-5xl">{packages.length} journeys</h2></div></div>
            {allPackages.length === 0 ? (
              <EmptyState title="No packages yet" description="Verified vendor packages will appear here once operators publish trips." />
            ) : packages.length ? (
              <div className="grid gap-5">{packages.map((pkg) => { const from = Math.min(...pkg.tiers.map((item) => item.pricePerPersonPerDay)); return <Card key={pkg.id} className="p-7"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><div className="flex flex-wrap gap-2"><Badge>{pkg.minDays}–{pkg.maxDays} days</Badge>{pkg.stops.some((stop) => stop.destination.requiresLocalTransport) && <Badge className="border-accent bg-[#fff4dc]"><Route size={12} /> Local hire route</Badge>}</div><h3 className="mt-4 text-2xl font-extrabold">{pkg.title}</h3><p className="mt-2 text-xs font-bold text-[#397668]">{pkg.vendor.businessName}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">{pkg.description}</p><div className="mt-5 flex flex-wrap gap-2">{pkg.stops.map((stop) => <span key={stop.destination.slug} className="rounded-full bg-muted px-3 py-1 text-xs">{stop.destination.name}</span>)}</div></div><div className="min-w-44 text-right"><p className="text-xs text-muted-foreground">Tier rate from</p><p className="text-xl font-extrabold">{formatPKR(from)}</p><p className="text-xs text-muted-foreground">per person / day</p><Button asChild className="mt-5"><Link href={"/packages/" + pkg.id}>Configure <ArrowRight size={16} /></Link></Button></div></div></Card>; })}</div>
            ) : (
              <EmptyState title="No exact matches" description="Try removing one filter to see more journeys." />
            )}
          </div>
        </div></section>
      </main><SiteFooter />
    </>
  );
}
