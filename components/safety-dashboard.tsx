"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SafetyPointResult } from "@/lib/overpass-core";

type SafetyResponse = {
  points?: SafetyPointResult[];
  degraded?: boolean;
  message?: string;
  error?: string;
};

export function SafetyDashboard({ slug }: { slug: string }) {
  const [points, setPoints] = useState<SafetyPointResult[]>([]);
  const [degraded, setDegraded] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/safety?slug=" + encodeURIComponent(slug), { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as SafetyResponse;
        if (!response.ok) throw new Error(body.error ?? "Safety data unavailable.");
        setPoints(body.points ?? []);
        setDegraded(Boolean(body.degraded));
        setNotice(body.message ?? "");
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setDegraded(true);
        setNotice(reason instanceof Error ? reason.message : "Safety data unavailable.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  if (loading) return <Card className="p-6">Loading nearby safety points from OpenStreetMap…</Card>;

  const grouped = points.reduce<Record<string, SafetyPointResult[]>>((acc, point) => {
    acc[point.type] = acc[point.type] ?? [];
    acc[point.type].push(point);
    return acc;
  }, {});

  return (
    <Card className="p-7">
      <p className="eyebrow text-[#5a7f73]">Safety dashboard</p>
      <h2 className="display-title mt-2 text-4xl">Nearby services</h2>
      <p className="mt-3 text-sm text-muted-foreground">Live data from OSM Overpass within ~35 km. Always confirm locally before relying on this in an emergency.</p>
      {degraded && (
        <div className="mt-5 flex gap-3 rounded-xl bg-[#fff4dc] p-4 text-sm text-[#725f42]">
          <AlertTriangle className="shrink-0" size={18} />
          <p>{notice || "Safety lookup temporarily unavailable. Try again in a few minutes."}</p>
        </div>
      )}
      {Object.keys(grouped).length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#397668]">{type}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {items.map((item, index) => (
                  <li key={index} className="rounded-xl bg-muted p-3">
                    <strong>{item.name}</strong>
                    {item.phone ? <span className="block text-muted-foreground">{item.phone}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : !degraded ? (
        <p className="mt-6 text-sm text-muted-foreground">No mapped safety points returned for this area.</p>
      ) : null}
    </Card>
  );
}
