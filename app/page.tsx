import Link from "next/link";
import { ArrowRight, BedDouble, BusFront, Compass, Map, ShieldCheck, Sparkles, TentTree, UsersRound } from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { GradientText } from "@/components/reactbits/gradient-text";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DestinationCard } from "@/components/destination-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRegions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const regions = await getRegions();
  const featured = regions.flatMap((region) => region.destinations).filter((item) => ["hunza-valley", "deosai-sheosar-lake", "saif-ul-malook-lake"].includes(item.slug));
  return (
    <>
      <section className="relative min-h-[760px] overflow-hidden bg-[radial-gradient(circle_at_70%_25%,#4b8c7c_0,#214c41_31%,#0c2923_72%)] text-white">
        <SiteHeader />
        <HeroScene />
        <div className="container-shell relative z-10 flex min-h-[760px] items-center pt-24">
          <div className="max-w-3xl pb-20">
            <p className="eyebrow mb-6 text-accent">Northern Pakistan · one thoughtful journey</p>
            <h1 className="display-title text-[clamp(4rem,10vw,8.5rem)] leading-[.78]">Go beyond<br /><GradientText className="italic">the postcard.</GradientText></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-white/72 md:text-lg">Discover mountain regions, compare transparent trip tiers and plan with local operators—without losing the practical details that matter on the road.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent"><Link href="/regions/gilgit-baltistan">Explore destinations <ArrowRight size={18} /></Link></Button>
              <Button asChild size="lg" className="border-white/25 bg-white/10 hover:bg-white/20"><Link href="/trip-builder"><Sparkles size={18} /> Build my trip</Link></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-7 text-sm text-white/65"><span><strong className="text-white">{regions.length}</strong> mountain regions</span><span><strong className="text-white">{regions.flatMap((item) => item.destinations).length}</strong> verified coordinates</span><span><strong className="text-white">2-layer</strong> transport pricing</span></div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 z-20 hidden rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:block"><p className="eyebrow text-accent">Built for real roads</p><p className="mt-2 max-w-[220px] text-sm text-white/70">Pickup travel and local 4x4 hire stay separate, so estimates remain clear.</p></div>
      </section>

      <main>
        <section className="section-pad">
          <div className="container-shell">
            <Reveal className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div><p className="eyebrow text-[#5a7f73]">Start with a region</p><h2 className="display-title mt-3 text-5xl leading-none md:text-7xl">Three landscapes.<br />Countless ways in.</h2></div>
              <p className="max-w-xl text-base leading-8 text-muted-foreground lg:justify-self-end">Every destination belongs to a real region in Ghoomora’s database. Browse by geography first, then narrow by season, altitude, trip length and comfort.</p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {regions.map((region, index) => (
                <Reveal key={region.slug}><Link href={"/regions/" + region.slug} className="focus-ring group block min-h-72 overflow-hidden rounded-[2rem] bg-primary p-7 text-white transition hover:-translate-y-1" style={{ backgroundColor: index === 1 ? "#28475d" : index === 2 ? "#674b35" : undefined }}>
                  <span className="grid size-12 place-items-center rounded-full bg-white/12"><Compass /></span><p className="mt-16 text-sm text-white/55">{region.destinations.length} destinations</p><h3 className="display-title mt-2 text-4xl">{region.name}</h3><p className="mt-3 text-sm leading-6 text-white/65">{region.blurb}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-accent">Explore region <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </Link></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[#e5eee9]">
          <div className="container-shell">
            <Reveal className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow text-[#5a7f73]">A better way north</p><h2 className="display-title mt-3 text-5xl md:text-7xl">Plan with context.</h2></div><Button asChild variant="outline"><Link href="/packages">View all sample packages <ArrowRight size={17} /></Link></Button></Reveal>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">{featured.map((item, index) => <Reveal key={item.slug}><DestinationCard destination={item} index={index} /></Reveal>)}</div>
          </div>
        </section>

        <section className="section-pad bg-[#102e27] text-white">
          <div className="container-shell grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal><p className="eyebrow text-accent">One journey, connected</p><h2 className="display-title mt-4 text-6xl leading-[.9] md:text-8xl">The details<br />travel together.</h2><p className="mt-7 max-w-lg leading-8 text-white/65">Ghoomora brings discovery, trip tiers, pickup travel and specialist local transport into one understandable plan.</p><Button asChild size="lg" variant="accent" className="mt-8"><Link href="/trip-builder">Open trip builder <ArrowRight size={18} /></Link></Button></Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: Map, title: "Discover", text: "Browse real coordinates, seasons, elevation and terrain." }, { icon: BusFront, title: "Get there", text: "Compare group bus, private bus and private car fares." }, { icon: BedDouble, title: "Stay your way", text: "Standard, Moderate and Luxury tiers remain easy to compare." }, { icon: ShieldCheck, title: "Plan responsibly", text: "Required local 4x4 access is surfaced before a trip can proceed." }].map((feature, index) => <Reveal key={feature.title}><Card className={"h-full border-white/10 p-6 text-white " + (index === 0 ? "bg-[#1c4a3f]" : "bg-white/6")}><feature.icon className="text-accent" /><h3 className="mt-8 text-xl font-extrabold">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{feature.text}</p></Card></Reveal>)}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-shell">
            <Reveal className="text-center"><p className="eyebrow text-[#5a7f73]">Local expertise, one platform</p><h2 className="display-title mx-auto mt-3 max-w-4xl text-5xl md:text-7xl">Built for travelers and the people who make journeys possible.</h2></Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-4">{[{ icon: BusFront, title: "Transport" }, { icon: BedDouble, title: "Hotels" }, { icon: UsersRound, title: "Guides" }, { icon: TentTree, title: "Camps" }].map((item) => <Card key={item.title} className="p-6 text-center"><item.icon className="mx-auto text-[#397668]" /><h3 className="mt-5 font-extrabold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">One vendor profile can manage this service alongside others.</p></Card>)}</div>
            <Reveal className="mt-10 rounded-[2.5rem] bg-accent p-8 md:flex md:items-center md:justify-between md:p-12"><div><p className="eyebrow">For Northern Pakistan’s operators</p><h3 className="display-title mt-2 text-4xl md:text-5xl">Bring your business into the journey.</h3></div><Button asChild size="lg" className="mt-6 md:mt-0"><Link href="/dashboard">Open partner portal <ArrowRight size={18} /></Link></Button></Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
