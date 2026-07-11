import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarDays, Mountain, Route } from "lucide-react";
import { InnerHeader } from "@/components/inner-header";
import { SiteFooter } from "@/components/site-footer";
import { SafetyDashboard } from "@/components/safety-dashboard";
import { WeatherForecastPanel } from "@/components/weather-forecast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDestination, getPackages } from "@/lib/data";
import { getWeatherForecast } from "@/lib/weather";

export const dynamic = "force-dynamic";
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const destination = await getDestination((await params).slug);
  if (!destination) notFound();
  const [packages, forecast] = await Promise.all([getPackages(), getWeatherForecast(destination)]);
  const related = packages.filter((item) => item.stops.some((stop) => stop.destination.slug === destination.slug));
  return (
    <>
      <InnerHeader />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1c4c40] to-[#263e57] py-24 text-white"><div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_70%_20%,white_0,transparent_30%)]" /><div className="container-shell relative"><Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10"><Link href={"/regions/" + destination.region.slug}><ArrowLeft size={16} /> {destination.region.name}</Link></Button><div className="mt-16 flex flex-wrap gap-2"><Badge>{destination.difficulty}</Badge>{destination.requiresLocalTransport && <Badge className="border-accent bg-accent text-primary"><Route size={12} /> Local 4x4 required</Badge>}</div><h1 className="display-title mt-5 max-w-4xl text-7xl leading-[.85] md:text-9xl">{destination.name}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">{destination.description}</p></div></section>
        <section className="section-pad"><div className="container-shell grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><div><p className="eyebrow text-[#5a7f73]">Know before you go</p><h2 className="display-title mt-3 text-5xl">Mountain context, up front.</h2><div className="mt-8 grid gap-4 sm:grid-cols-3"><Card className="p-5"><Mountain className="text-[#397668]" /><p className="mt-5 text-2xl font-extrabold">{destination.elevationMeters.toLocaleString()}m</p><p className="text-sm text-muted-foreground">Reference elevation</p></Card><Card className="p-5"><CalendarDays className="text-[#397668]" /><p className="mt-5 text-2xl font-extrabold">{months[destination.bestSeasonStart - 1]}–{months[destination.bestSeasonEnd - 1]}</p><p className="text-sm text-muted-foreground">Typical season</p></Card><Card className="p-5"><Route className="text-[#397668]" /><p className="mt-5 text-2xl font-extrabold capitalize">{destination.difficulty}</p><p className="text-sm text-muted-foreground">Planning difficulty</p></Card></div></div><Card className="bg-[#efe3cb] p-7"><AlertTriangle className="text-[#8a5d1d]" /><h3 className="mt-5 text-xl font-extrabold">{destination.requiresLocalTransport ? "Local transport planning required" : "Road conditions still matter"}</h3><p className="mt-3 text-sm leading-7 text-[#6f604a]">{destination.localTransportNote ?? "Weather advisories are model-based, not confirmed road status. Confirm conditions with your operator before departure."}</p></Card></div></section>
        <section className="section-pad"><div className="container-shell"><SafetyDashboard slug={destination.slug} /></div></section>
        <section className="section-pad bg-[#e5eee9]"><div className="container-shell"><p className="eyebrow text-[#5a7f73]">Open-Meteo forecast</p><h2 className="display-title mt-2 text-5xl">Plan for the mountain weather.</h2><div className="mt-8"><WeatherForecastPanel forecast={forecast} /></div></div></section>
        <section className="section-pad bg-[#e5eee9]"><div className="container-shell"><h2 className="display-title text-5xl">Trips that include {destination.name}</h2>{related.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">{related.map((item) => <Card key={item.id} className="p-7"><p className="eyebrow text-[#5a7f73]">{item.minDays}–{item.maxDays} days</p><h3 className="mt-3 text-2xl font-extrabold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p><Button asChild className="mt-6"><Link href={"/packages/" + item.id}>View package</Link></Button></Card>)}</div> : <p className="mt-5 text-muted-foreground">No verified package includes this destination yet.</p>}</div></section>
      </main><SiteFooter />
    </>
  );
}
