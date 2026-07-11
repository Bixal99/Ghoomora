"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Info, Route } from "lucide-react";
import { getPriceEstimate } from "@/app/actions/pricing";
import type { PackageView } from "@/lib/data";
import { calculateEstimate, demoPickupFare } from "@/lib/pricing-core";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PackageConfigurator({ pkg, cities }: { pkg: PackageView; cities: { id: string; name: string; slug: string }[] }) {
  const [tierId, setTierId] = useState(pkg.tiers[0]?.id ?? "");
  const [days, setDays] = useState(pkg.minDays);
  const [travelers, setTravelers] = useState(2);
  const [pickupCity, setPickupCity] = useState(cities[0]?.slug ?? "islamabad");
  const [resolved, setResolved] = useState<Awaited<ReturnType<typeof getPriceEstimate>> | null>(null);
  const [pending, startTransition] = useTransition();
  const tier = pkg.tiers.find((item) => item.id === tierId) ?? pkg.tiers[0];
  const roughStops = useMemo(
    () => Array.from(new Set(pkg.stops.filter((stop) => stop.destination.requiresLocalTransport).map((stop) => stop.destination.slug))),
    [pkg],
  );

  useEffect(() => {
    const activeTier = pkg.tiers.find((item) => item.id === tierId) ?? pkg.tiers[0];
    if (!activeTier) return;
    startTransition(async () => {
      try {
        const estimate = await getPriceEstimate({ packageId: pkg.id, tierId: activeTier.id, pickupCitySlug: pickupCity, selectedDays: days, travelerCount: travelers });
        setResolved(estimate);
      } catch {
        const pickupBase = demoPickupFare(activeTier, pickupCity);
        const pickupFare = activeTier.transportMode === "SHARED" ? pickupBase * travelers : pickupBase;
        setResolved({
          ...calculateEstimate(pkg, activeTier, { selectedDays: days, travelerCount: travelers, pickupFare, localHireRates: roughStops.map(() => 18000) }),
          canCheckout: false,
          missingLocalHire: [],
          usingDemo: true,
        });
      }
    });
  }, [days, travelers, tierId, pickupCity, pkg, roughStops]);

  const estimate = resolved;

  if (!tier || !estimate) return <Card className="p-6">This package does not have a complete tier configuration.</Card>;

  const checkoutParams = new URLSearchParams({
    packageId: pkg.id,
    tierId: tier.id,
    pickupCity,
    days: String(days),
    travelers: String(travelers),
  });

  return (
    <Card className="overflow-hidden">
      <div className="bg-primary p-7 text-white"><p className="eyebrow text-accent">Configure an estimate</p><h2 className="display-title mt-2 text-4xl">Shape this journey.</h2></div>
      <div className="space-y-7 p-7">
        <fieldset><legend className="mb-3 text-sm font-extrabold">Travel tier</legend><div className="grid grid-cols-3 gap-2">{pkg.tiers.map((item) => <button key={item.id} onClick={() => setTierId(item.id)} className={"focus-ring rounded-xl border px-2 py-3 text-xs font-extrabold " + (item.id === tierId ? "border-primary bg-primary text-white" : "bg-white")} aria-pressed={item.id === tierId}>{item.tier}</button>)}</div></fieldset>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Pickup city<select className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" value={pickupCity} onChange={(event) => setPickupCity(event.target.value)}>{cities.map((city) => <option key={city.id} value={city.slug}>{city.name}</option>)}</select></label><label className="text-sm font-bold">Travelers<input className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" type="number" min={1} max={30} value={travelers} onChange={(event) => setTravelers(Math.max(1, Number(event.target.value)))} /></label></div>
        <label className="block text-sm font-bold">Days: <span className="text-[#397668]">{days}</span><input className="mt-3 w-full accent-[#173f35]" type="range" min={pkg.minDays} max={pkg.maxDays} value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
        <div className="rounded-2xl bg-muted p-5 text-sm">
          {pending && <p className="mb-3 text-xs text-muted-foreground">Updating live fares…</p>}
          <Line label={tier.transportMode === "SHARED" ? "Pickup fare (all seats)" : "Pickup vehicle fare"} value={estimate.pickupFare} />
          <Line label="Stay & tier inclusions" value={estimate.stayAndExtras} />
          {roughStops.length > 0 && <Line label={tier.tier === "LUXURY" ? "Local 4x4 (bundled)" : "Local 4x4 day-hire"} value={estimate.localTransport} />}
          <div className="my-4 border-t" />
          <div className="flex items-center justify-between"><strong>Estimated total</strong><strong className="text-xl">{formatPKR(estimate.total)}</strong></div>
          {estimate.usingDemo && <p className="mt-3 text-xs text-[#8a5d1d]">Using demo fares — connect database and verified vendor inventory for live pricing.</p>}
          {estimate.missingLocalHire.length > 0 && tier.tier !== "LUXURY" && <p className="mt-3 text-xs font-bold text-[#8a5d1d]">Missing local hire rates for: {estimate.missingLocalHire.join(", ")}</p>}
        </div>
        <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Info size={15} className="mt-0.5 shrink-0" />Prices itemize pickup, stay, and local 4x4 separately per Ghoomora&apos;s transport model.</div>
        {estimate.canCheckout ? (
          <Button asChild className="w-full" size="lg"><Link href={"/checkout?" + checkoutParams.toString()}><Check size={18} /> Continue to checkout</Link></Button>
        ) : (
          <Button className="w-full" size="lg" disabled><Check size={18} /> Checkout unavailable — missing local hire rates</Button>
        )}
        {roughStops.length > 0 && <p className="flex gap-2 text-xs font-bold text-[#8a5d1d]"><Route size={15} /> This itinerary reaches {roughStops.length} destination{roughStops.length > 1 ? "s" : ""} that require specialist local transport.</p>}
      </div>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return <div className="mb-2 flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="font-bold">{formatPKR(value)}</span></div>;
}
