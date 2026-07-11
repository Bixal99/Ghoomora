"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPKR } from "@/lib/utils";

export function AiTripAssistant({ regionSlug }: { regionSlug?: string }) {
  const [budget, setBudget] = useState(150000);
  const [days, setDays] = useState(5);
  const [interests, setInterests] = useState("forts, lakes, moderate hiking");
  const [stops, setStops] = useState<Array<{ dayNumber: number; destinationName: string; stopType: string; note?: string }>>([]);
  const [estimate, setEstimate] = useState<{ total: number; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function runPlanner() {
    setLoading(true);
    const response = await fetch("/api/ai-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "planner", budget, days, interests, regionSlug }) });
    const body = await response.json();
    setStops(body.stops ?? []);
    setLoading(false);
  }

  async function runEstimator() {
    setLoading(true);
    const response = await fetch("/api/ai-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "estimator", days, travelers: 2, tier: "MODERATE", regionSlug }) });
    const body = await response.json();
    setEstimate(body);
    setLoading(false);
  }

  return (
    <Card className="mx-auto mt-10 max-w-5xl p-7">
      <div className="flex items-center gap-2"><Sparkles className="text-[#397668]" /><h2 className="text-xl font-extrabold">AI-assisted planning</h2></div>
      <p className="mt-2 text-sm text-muted-foreground">Suggestions use only destinations already in Ghoomora. Always verify routes and operators locally.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-bold">Budget (PKR)<input type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
        <label className="text-sm font-bold">Days<input type="number" min={2} max={21} value={days} onChange={(event) => setDays(Number(event.target.value))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
        <label className="text-sm font-bold md:col-span-1">Interests<input value={interests} onChange={(event) => setInterests(event.target.value)} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button type="button" disabled={loading} onClick={runPlanner}>Suggest itinerary</Button><Button type="button" variant="outline" disabled={loading} onClick={runEstimator}>Estimate costs</Button></div>
      {stops.length > 0 && <ol className="mt-6 space-y-2 text-sm">{stops.map((stop) => <li key={stop.dayNumber} className="rounded-xl bg-muted p-3"><strong>Day {stop.dayNumber}:</strong> {stop.destinationName} · {stop.stopType}{stop.note ? " — " + stop.note : ""}</li>)}</ol>}
      {estimate && <p className="mt-6 text-sm"><strong>Estimated total:</strong> {formatPKR(estimate.total)}. {estimate.disclaimer}</p>}
    </Card>
  );
}
