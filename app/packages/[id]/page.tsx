import { notFound } from "next/navigation";
import { BedDouble, BusFront, Check, MapPin } from "lucide-react";
import { InnerHeader } from "@/components/inner-header";
import { PackageConfigurator } from "@/components/package-configurator";
import { RouteExperience } from "@/components/map/route-experience";
import { SiteFooter } from "@/components/site-footer";
import { JourneyWeather } from "@/components/weather-forecast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPackage, getPickupCities } from "@/lib/data";
import { formatPKR } from "@/lib/utils";
import { getWeatherForecast } from "@/lib/weather";

export const dynamic = "force-dynamic";

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const pkg = await getPackage((await params).id);
  if (!pkg) notFound();
  const uniqueStops = Array.from(new Map(pkg.stops.map((stop) => [stop.destination.id, stop.destination])).values());
  const [cities, forecasts] = await Promise.all([getPickupCities(), Promise.all(uniqueStops.map(getWeatherForecast))]);
  const weatherRisks = Object.fromEntries(
    uniqueStops.map((stop, index) => [stop.id, forecasts[index]?.days[0]?.risk]).filter(([, risk]) => risk),
  ) as Record<string, import("@/lib/route-types").TravelRisk>;
  return (
    <>
      <InnerHeader />
      <main>
        <section className="bg-[#13382f] py-20 text-white"><div className="container-shell"><div className="flex flex-wrap gap-2"><Badge>{pkg.minDays}–{pkg.maxDays} days</Badge><Badge>{pkg.vendor.businessName}</Badge></div><h1 className="display-title mt-5 max-w-5xl text-6xl leading-[.9] md:text-8xl">{pkg.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">{pkg.description}</p></div></section>
        <section className="section-pad"><div className="container-shell grid gap-10 lg:grid-cols-[1.15fr_.85fr]"><div><p className="eyebrow text-[#5a7f73]">Day by day</p><h2 className="display-title mt-2 text-5xl">The itinerary</h2><div className="mt-8 space-y-4">{pkg.stops.map((stop) => <Card key={stop.dayNumber + stop.destination.slug} className="flex gap-5 p-6"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-white">{stop.dayNumber}</span><div><p className="text-xs font-bold uppercase tracking-wider text-[#397668]">{stop.stopType}</p><h3 className="mt-1 text-xl font-extrabold">{stop.destination.name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{stop.destination.description}</p>{stop.destination.requiresLocalTransport && <p className="mt-3 text-xs font-bold text-[#8a5d1d]">Specialist local transport required beyond the regional road route.</p>}</div></Card>)}</div><h2 className="display-title mt-14 text-5xl">Compare tiers</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{pkg.tiers.map((tier) => <Card key={tier.id} className="p-5"><Badge>{tier.tier}</Badge><p className="mt-5 text-xl font-extrabold">{formatPKR(tier.pricePerPersonPerDay)}</p><p className="text-xs text-muted-foreground">per person / day</p><div className="mt-5 space-y-2 text-xs"><p className="flex gap-2"><BusFront size={14} /> {tier.vehicleType} · {tier.transportMode}</p><p className="flex gap-2"><BedDouble size={14} /> {tier.hotelTier} stay</p><p className="flex gap-2"><Check size={14} /> {tier.includesGuide ? "Dedicated guide" : "Guide not included"}</p></div></Card>)}</div></div><aside><div className="sticky top-5"><PackageConfigurator pkg={pkg} cities={cities} /><p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><MapPin size={14} /> Pickup fares vary by city and destination region.</p></div></aside></div></section>
        <section className="section-pad bg-[#e5eee9]"><div className="container-shell"><p className="eyebrow text-[#5a7f73]">OpenRouteService · regional roads</p><h2 className="display-title mt-2 text-5xl md:text-7xl">See how the journey moves.</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Distance, driving time and elevation are planning estimates. Local jeep tracks and hikes remain separate from the main road line.</p><div className="mt-9"><RouteExperience packageId={pkg.id} weatherRisks={weatherRisks} /></div></div></section>
        <section className="section-pad"><div className="container-shell"><p className="eyebrow text-[#5a7f73]">Weather intelligence</p><h2 className="display-title mt-2 text-5xl">Conditions across the itinerary.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">These model-based advisories help with planning but do not confirm road openings or closures.</p><div className="mt-8"><JourneyWeather forecasts={forecasts} /></div></div></section>
      </main><SiteFooter />
    </>
  );
}
