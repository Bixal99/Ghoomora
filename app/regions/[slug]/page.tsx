import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destination-card";
import { DestinationMap } from "@/components/map/destination-map";
import { InnerHeader } from "@/components/inner-header";
import { SiteFooter } from "@/components/site-footer";
import { getRegion } from "@/lib/data";
import { getWeatherForecast } from "@/lib/weather";

export const dynamic = "force-dynamic";

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const region = await getRegion((await params).slug);
  if (!region) notFound();
  const forecasts = await Promise.all(region.destinations.map(getWeatherForecast));
  return (
    <>
      <InnerHeader />
      <main>
        <section className="bg-[#13382f] py-20 text-white"><div className="container-shell"><p className="eyebrow text-accent">Region guide</p><h1 className="display-title mt-3 text-6xl md:text-8xl">{region.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{region.blurb} Explore {region.destinations.length} places with verified reference coordinates.</p></div></section>
        <section className="section-pad"><div className="container-shell"><div className="mb-10 flex items-end justify-between"><div><p className="eyebrow text-[#5a7f73]">Geography first</p><h2 className="display-title mt-2 text-5xl">See the region at a glance.</h2></div></div><DestinationMap destinations={region.destinations} forecasts={forecasts} /></div></section>
        <section className="section-pad bg-[#e5eee9]"><div className="container-shell"><h2 className="display-title text-5xl">Destinations</h2><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{region.destinations.map((item, index) => <DestinationCard key={item.slug} destination={item} index={index} />)}</div></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
