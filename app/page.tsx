import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BedDouble, BusFront, Compass, Map, Route, ShieldCheck, TentTree, UsersRound } from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { HeroTypewriter } from "@/components/hero-typewriter";
import { HomeHeroCta } from "@/components/home-hero-cta";
import { SiteHeaderShell } from "@/components/site-header-shell";
import { SiteFooter } from "@/components/site-footer";
import { DestinationCard } from "@/components/destination-card";
import { RegionCard } from "@/components/region-card";
import { RouteRibbon } from "@/components/route-ribbon";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { loadRegions } from "@/lib/data";
import { CatalogSetupPanel } from "@/components/catalog-setup-panel";
import { EmptyState } from "@/components/empty-state";
import { getRoleHomePath } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const actor = await getActor();
  if (actor) redirect(getRoleHomePath(actor.role));

  const catalog = await loadRegions();
  const regions = catalog.status === "ready" ? catalog.data : [];
  const featured = regions.flatMap((region) => region.destinations).filter((item) => ["hunza-valley", "deosai-sheosar-lake", "saif-ul-malook-lake"].includes(item.slug));
  return (
    <>
      <section className="relative min-h-[720px] overflow-hidden bg-[radial-gradient(circle_at_72%_20%,#5b9c8b_0,#245246_29%,#0b2821_72%)] text-white">
        <SiteHeaderShell />
        <HeroScene />
        <div className="container-shell relative z-10 flex min-h-[720px] items-center pt-28">
          <div className="max-w-3xl pb-20">
            <HeroTypewriter />
            <p className="mt-8 max-w-xl text-base leading-8 text-white/80 md:text-lg">Explore mountain places and plan with local operators—clear details for the road ahead.</p>
            <HomeHeroCta />
          </div>
        </div>
      </section>

      <main>
        <section className="section-pad">
          <div className="container-shell">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-[#5a7f73]">What you can do</p>
              <h2 className="display-title mt-3 text-5xl leading-none md:text-7xl">Services for the road ahead.</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">Discover places, compare packages, shape a trip, and book with operators you can trust.</p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Compass, title: "Discover regions", text: "Browse real Northern Pakistan geography before you commit to a route.", href: "#regions", cta: "Explore regions" },
                { icon: Map, title: "Compare packages", text: "See tiers, timing, and inclusions side by side so choices stay clear.", href: "/packages", cta: "View packages" },
                { icon: Route, title: "Build a trip", text: "Assemble destinations, transport, and stays into one coherent plan.", href: "/trip-builder", cta: "Open trip builder" },
                { icon: ShieldCheck, title: "Book with verified operators", text: "Work with local partners whose services sit inside the journey, not beside it.", href: "/packages", cta: "Browse packages" },
              ].map((service) => (
                <Reveal key={service.title} className="h-full">
                  <Card className="flex h-full min-h-64 flex-col p-6">
                    <service.icon className="text-[#397668]" />
                    <h3 className="mt-8 text-xl font-extrabold">{service.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{service.text}</p>
                    <Link href={service.href} className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#397668]">
                      {service.cta} <ArrowRight size={16} />
                    </Link>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="regions" className="section-pad bg-[#e8efe9]">
          <div className="container-shell">
            <Reveal className="grid gap-8 lg:grid-cols-[1fr_minmax(10rem,16rem)_1fr] lg:items-center">
              <div>
                <p className="eyebrow text-[#5a7f73]">Start with a region</p>
                <h2 className="display-title mt-3 text-5xl leading-none md:text-7xl">Landscapes worth<br />planning around.</h2>
                <RouteRibbon className="mt-5 w-44 lg:hidden" />
              </div>
              <RouteRibbon className="mx-auto hidden w-full max-w-xs lg:block" />
              <p className="max-w-xl text-base leading-8 text-muted-foreground lg:justify-self-end">Every destination belongs to a real region in Ghoomora’s database. Browse by geography first, then narrow by season, altitude, trip length and comfort.</p>
            </Reveal>
            {catalog.status === "setup" ? (
              <CatalogSetupPanel />
            ) : regions.length === 0 ? (
              <div className="mt-12">
                <EmptyState title="No regions yet" description="Add regions and destinations with Prisma Studio. See docs/ADDING_REAL_DATA.md." />
              </div>
            ) : (
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {regions.map((region, index) => (
                  <Reveal key={region.slug} className="h-full">
                    <RegionCard region={region} index={index} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section-pad">
          <div className="container-shell">
            <Reveal className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow text-[#5a7f73]">A better way north</p><h2 className="display-title mt-3 text-5xl md:text-7xl">Plan with context.</h2></div><Button asChild variant="outline"><Link href="/packages">View all packages <ArrowRight size={17} /></Link></Button></Reveal>
            {featured.length > 0 ? (
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {featured.map((item, index) => (
                  <Reveal key={item.slug} className="h-full">
                    <DestinationCard destination={item} index={index} />
                  </Reveal>
                ))}
              </div>
            ) : catalog.status === "ready" ? (
              <div className="mt-12">
                <EmptyState title="No featured destinations yet" description="Once destinations exist in the database, highlights will appear here." />
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-pad bg-[radial-gradient(circle_at_82%_18%,#245a4c_0,#102e27_34%,#0b241e_75%)] text-white">
          <div className="container-shell grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal><p className="eyebrow text-accent">One journey, connected</p><h2 className="display-title mt-4 text-6xl leading-[.9] md:text-8xl">The details<br />travel together.</h2><p className="mt-7 max-w-lg leading-8 text-white/65">Ghoomora brings discovery, trip tiers, pickup travel and specialist local transport into one understandable plan.</p><Button asChild size="lg" variant="accent" className="mt-8"><Link href="/trip-builder">Open trip builder <ArrowRight size={18} /></Link></Button></Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Map, title: "Discover", text: "Browse real coordinates, seasons, elevation and terrain." },
                { icon: BusFront, title: "Get there", text: "Compare group bus, private bus and private car fares." },
                { icon: BedDouble, title: "Stay your way", text: "Standard, Moderate and Luxury tiers remain easy to compare." },
                { icon: ShieldCheck, title: "Plan responsibly", text: "Required local 4x4 access is surfaced before a trip can proceed." },
              ].map((feature, index) => (
                <Reveal key={feature.title} className="h-full">
                  <Card className={"flex h-full flex-col border-white/10 p-6 text-white " + (index === 0 ? "bg-[#1c4a3f]" : "bg-white/[.07]")}>
                    <feature.icon className="text-accent" />
                    <h3 className="mt-8 text-xl font-extrabold">{feature.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-white/60">{feature.text}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[#e8efe9]">
          <div className="container-shell">
            <Reveal className="text-center"><p className="eyebrow text-[#5a7f73]">Local expertise, one platform</p><h2 className="display-title mx-auto mt-3 max-w-4xl text-5xl md:text-7xl">Built for travelers and the people who make journeys possible.</h2></Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {[
                { icon: BusFront, title: "Transport" },
                { icon: BedDouble, title: "Hotels" },
                { icon: UsersRound, title: "Guides" },
                { icon: TentTree, title: "Camps" },
              ].map((item) => (
                <Card key={item.title} className="flex h-full min-h-44 flex-col p-6 text-center">
                  <item.icon className="mx-auto text-[#397668]" />
                  <h3 className="mt-5 font-extrabold">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">One vendor profile can manage this service alongside others.</p>
                </Card>
              ))}
            </div>
            <Reveal className="mt-10 rounded-[2.5rem] border border-[#d99a3f] bg-[linear-gradient(135deg,#f4bd68,#e9a74a)] p-8 shadow-[0_25px_70px_rgba(98,67,23,.18)] md:flex md:items-center md:justify-between md:p-12"><div><p className="eyebrow">For Northern Pakistan’s operators</p><h3 className="display-title mt-2 text-4xl md:text-5xl">Bring your business into the journey.</h3></div><Button asChild size="lg" className="mt-6 md:mt-0"><Link href="/profile#vendor-application">Become a vendor <ArrowRight size={18} /></Link></Button></Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
