import Link from "next/link";
import { ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { CatalogSetupPanel } from "@/components/catalog-setup-panel";
import { EmptyState } from "@/components/empty-state";
import { InnerHeaderShell } from "@/components/inner-header-shell";
import { SiteFooter } from "@/components/site-footer";
import { AiTripAssistant } from "@/components/ai-trip-assistant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadPackages, loadPickupCities, loadRegions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TripBuilder({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const region = typeof params.region === "string" ? params.region : "";
  const tier = typeof params.tier === "string" ? params.tier : "";
  const days = typeof params.days === "string" ? Math.max(1, Number(params.days)) : 5;
  const travelers = typeof params.travelers === "string" ? Math.max(1, Number(params.travelers)) : 2;
  const pickup = typeof params.pickup === "string" ? params.pickup : "";
  const date = typeof params.date === "string" ? params.date : "";
  const [regionsLoad, citiesLoad, packagesLoad] = await Promise.all([loadRegions(), loadPickupCities(), loadPackages()]);

  if (regionsLoad.status === "setup" || citiesLoad.status === "setup" || packagesLoad.status === "setup") {
    return (
      <>
        <InnerHeaderShell />
        <main><CatalogSetupPanel /></main>
        <SiteFooter />
      </>
    );
  }

  const regions = regionsLoad.data;
  const cities = citiesLoad.data;
  const submitted = Boolean(params.region || params.tier || params.date);
  const packages = packagesLoad.data.filter((pkg) => (!region || pkg.stops.some((stop) => stop.destination.region.slug === region)) && (!tier || pkg.tiers.some((item) => item.tier === tier)) && days >= pkg.minDays && days <= pkg.maxDays);
  const pickupValue = pickup || cities[0]?.slug || "";

  return (
    <>
      <InnerHeaderShell />
      <main className="min-h-screen bg-[#e5eee9] py-16"><div className="container-shell"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow text-[#5a7f73]">No AI guesswork</p><h1 className="display-title mt-3 text-6xl md:text-8xl">Build around what matters.</h1><p className="mt-5 leading-8 text-muted-foreground">Choose your practical constraints. Ghoomora will match them against complete, verified package structures.</p></div>
        {regions.length === 0 || cities.length === 0 ? (
          <div className="mx-auto mt-12 max-w-5xl">
            <EmptyState title="Catalog not ready yet" description="Add regions, destinations, and pickup cities via Prisma Studio before matching trips. See docs/ADDING_REAL_DATA.md." />
          </div>
        ) : (
          <Card className="mx-auto mt-12 max-w-5xl p-7 md:p-9"><form className="grid gap-5 md:grid-cols-3"><label className="text-sm font-bold">Region<select name="region" defaultValue={region} className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3" required><option value="">Choose region</option>{regions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label className="text-sm font-bold">Preferred tier<select name="tier" defaultValue={tier} className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3"><option value="">Any tier</option><option>STANDARD</option><option>MODERATE</option><option>LUXURY</option></select></label><label className="text-sm font-bold">Pickup city<select name="pickup" defaultValue={pickupValue} className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3">{cities.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label><label className="text-sm font-bold">Days<input name="days" defaultValue={days} type="number" min={2} max={30} className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Travelers<input name="travelers" defaultValue={travelers} type="number" min={1} max={30} className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Earliest departure<input name="date" defaultValue={date} type="date" className="focus-ring mt-2 h-12 w-full rounded-xl border bg-white px-3" /></label><Button size="lg" className="md:col-span-3"><SlidersHorizontal size={18} /> Find matching trips</Button></form></Card>
        )}
        <AiTripAssistant regionSlug={region || undefined} />
        {submitted && <section className="mx-auto mt-12 max-w-5xl"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#5a7f73]">Matched to your plan</p><h2 className="display-title mt-2 text-5xl">{packages.length} options</h2></div><Sparkles className="text-[#397668]" /></div><div className="mt-7 grid gap-4">{packages.map((pkg) => <Card key={pkg.id} className="flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center"><div><h3 className="text-xl font-extrabold">{pkg.title}</h3><p className="mt-2 text-sm text-muted-foreground">{pkg.minDays}–{pkg.maxDays} days · {pkg.stops.map((stop) => stop.destination.name).join(" → ")}</p></div><Button asChild><Link href={"/packages/" + pkg.id}>Configure for {travelers} <ArrowRight size={16} /></Link></Button></Card>)}{packages.length === 0 && <EmptyState title="No complete package fits yet" description="Try a different duration or remove the tier preference." />}</div></section>}
      </div></main><SiteFooter />
    </>
  );
}
