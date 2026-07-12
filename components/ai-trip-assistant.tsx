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
  const [error, setError] = useState("");
  const [planned, setPlanned] = useState(false);

  function validatePlannerInputs() {
    if (!Number.isFinite(days) || days < 2 || days > 21) return "Days must be between 2 and 21.";
    if (!Number.isFinite(budget) || budget <= 0) return "Budget must be a positive number.";
    if (interests.trim().length < 3) return "Interests must be at least 3 characters.";
    return "";
  }

  function validateEstimatorInputs() {
    if (!Number.isFinite(days) || days < 2 || days > 21) return "Days must be between 2 and 21.";
    return "";
  }

  async function runPlanner() {
    const validationError = validatePlannerInputs();
    if (validationError) {
      setError(validationError);
      setPlanned(false);
      return;
    }

    setLoading(true);
    setError("");
    setPlanned(false);
    try {
      const response = await fetch("/api/ai-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "planner", budget, days, interests, regionSlug }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not build an itinerary. Try adjusting your inputs.");
      setStops(body.stops ?? []);
      setPlanned(true);
    } catch (reason) {
      setStops([]);
      setPlanned(false);
      setError(reason instanceof Error ? reason.message : "AI planner is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  async function runEstimator() {
    const validationError = validateEstimatorInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "estimator", days, travelers: 2, tier: "MODERATE", regionSlug }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not estimate this trip. Try adjusting your inputs.");
      setEstimate(body);
    } catch (reason) {
      setEstimate(null);
      setError(reason instanceof Error ? reason.message : "AI estimator is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-primary/10 bg-white open:shadow-lg">
      <summary className="cursor-pointer list-none p-7 font-extrabold marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2"><Sparkles className="text-[#397668]" /> Get AI suggestions (optional)</span>
      </summary>
      <Card className="border-0 shadow-none">
        <div className="px-7 pb-7">
      <p className="text-sm text-muted-foreground">Suggestions use only destinations already in Ghoomora. Always verify routes and operators locally.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-bold">
          Budget (PKR)
          <input type="number" min={1} value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" />
        </label>
        <label className="text-sm font-bold">
          Days
          <input type="number" min={2} max={21} value={days} onChange={(event) => setDays(Number(event.target.value))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">2–21 days</span>
        </label>
        <label className="text-sm font-bold md:col-span-1">
          Interests
          <input value={interests} onChange={(event) => setInterests(event.target.value)} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button type="button" disabled={loading} onClick={runPlanner}>{loading ? "Planning…" : "Suggest itinerary"}</Button><Button type="button" variant="outline" disabled={loading} onClick={runEstimator}>Estimate costs</Button></div>
      {error && <p className="mt-5 rounded-xl bg-[#fff4dc] p-3 text-sm text-[#725f42]">{error}</p>}
      {stops.length > 0 && <ol className="mt-6 space-y-2 text-sm">{stops.map((stop) => <li key={stop.dayNumber} className="rounded-xl bg-muted p-3"><strong>Day {stop.dayNumber}:</strong> {stop.destinationName} · {stop.stopType}{stop.note ? " — " + stop.note : ""}</li>)}</ol>}
      {planned && !error && stops.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No itinerary could be built for those inputs. Try widening the days or interests.</p>}
      {estimate && <p className="mt-6 text-sm"><strong>Estimated total:</strong> {formatPKR(estimate.total)}. {estimate.disclaimer}</p>}
        </div>
      </Card>
    </details>
  );
}
