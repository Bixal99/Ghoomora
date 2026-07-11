"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Gauge, MapPinned, Mountain, Pause, Play, RefreshCcw, Route, Timer, TrendingUp } from "lucide-react";
import type { RouteErrorBody, RouteResult } from "@/lib/route-types";
import { interpolateRouteCoordinate } from "@/lib/route-math";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANIMATION_DURATION = 22_000;

function formatDistance(value: number) { return value >= 1000 ? Math.round(value / 1000).toLocaleString() + " km" : Math.round(value) + " m"; }
function formatDuration(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.round((value % 3600) / 60);
  return hours ? hours + "h " + minutes + "m" : minutes + "m";
}

export function RouteExperience({ packageId }: { packageId: string }) {
  const mapHost = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const travelMarker = useRef<maplibregl.Marker | null>(null);
  const frame = useRef(0);
  const startedAt = useRef(0);
  const progressRef = useRef(0);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<RouteErrorBody | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const reducedMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId }), signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw body as RouteErrorBody;
        return body as RouteResult;
      })
      .then((body) => { setResult(body); setPlaying(!reducedMotion); })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason?.code ? reason : { code: "SERVICE_UNAVAILABLE", message: "Route visualization is temporarily unavailable.", retryable: true }); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [packageId, reducedMotion]);

  useEffect(() => {
    if (!result || !mapHost.current || mapRef.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapHost.current,
        style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
        center: result.geometry.coordinates[0].slice(0, 2) as [number, number], zoom: 6, attributionControl: {},
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: result.geometry } });
        map.addLayer({ id: "route-shadow", type: "line", source: "route", paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": .7 } });
        map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#173f35", "line-width": 5 } });
        const bounds = new maplibregl.LngLatBounds();
        result.geometry.coordinates.forEach((coordinate) => bounds.extend([coordinate[0], coordinate[1]]));
        map.fitBounds(bounds, { padding: 54, maxZoom: 10, duration: reducedMotion ? 0 : 900 });
        result.waypoints.forEach((waypoint) => {
          const element = document.createElement("button");
          element.className = "grid size-9 place-items-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-lg " + (waypoint.requiresLocalTransport ? "bg-[#b66b25]" : "bg-[#173f35]");
          element.textContent = String(waypoint.dayNumber);
          element.setAttribute("aria-label", "Day " + waypoint.dayNumber + ": " + waypoint.destinationName);
          new maplibregl.Marker({ element }).setLngLat([waypoint.coordinate[0], waypoint.coordinate[1]]).setPopup(new maplibregl.Popup({ offset: 20 }).setText(waypoint.destinationName + " · " + waypoint.stopType + (waypoint.requiresLocalTransport ? " · local transport required" : ""))).addTo(map);
        });
        const travelElement = document.createElement("div");
        travelElement.className = "grid size-8 place-items-center rounded-full border-4 border-white bg-[#e7a94e] text-[#173f35] shadow-xl";
        travelElement.innerHTML = "●";
        travelMarker.current = new maplibregl.Marker({ element: travelElement }).setLngLat(result.geometry.coordinates[0].slice(0, 2) as [number, number]).addTo(map);
      });
    } catch { queueMicrotask(() => setMapUnavailable(true)); return; }
    return () => { map.remove(); mapRef.current = null; travelMarker.current = null; };
  }, [result, reducedMotion]);

  useEffect(() => {
    progressRef.current = progress;
    if (!result || !travelMarker.current) return;
    const coordinate = interpolateRouteCoordinate(result.geometry.coordinates, progress);
    travelMarker.current.setLngLat([coordinate[0], coordinate[1]]);
  }, [progress, result]);

  useEffect(() => {
    if (!playing || !result) return;
    startedAt.current = performance.now() - progressRef.current * ANIMATION_DURATION;
    const tick = (timestamp: number) => {
      const next = Math.min(1, (timestamp - startedAt.current) / ANIMATION_DURATION);
      setProgress(next);
      if (next >= 1) setPlaying(false);
      else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing, result]);

  if (loading) return <Card className="grid min-h-80 place-items-center p-8"><div className="text-center"><div className="mx-auto size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /><p className="eyebrow mt-5 text-[#5a7f73]">Calculating road route</p></div></Card>;
  if (error) return <Card className="border-[#d4a14f] bg-[#fff4dc] p-7"><AlertTriangle className="text-[#986520]" /><h3 className="mt-4 text-xl font-extrabold">Route view unavailable</h3><p className="mt-2 text-sm leading-7 text-[#725f42]">{error.message} The day-by-day itinerary remains available above.</p>{error.retryable && <Button variant="outline" className="mt-5" onClick={() => window.location.reload()}><RefreshCcw size={16} /> Try again</Button>}</Card>;
  if (!result) return null;

  const chartData = result.elevationProfile.map((item) => ({ ...item, distanceKm: Number((item.distanceMeters / 1000).toFixed(1)) }));
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric icon={Route} label="Road distance" value={formatDistance(result.summary.distanceMeters)} />
        <Metric icon={Timer} label="Driving estimate" value={formatDuration(result.summary.durationSeconds)} />
        <Metric icon={Mountain} label="Elevation" value={result.summary.minimumElevationMeters + "–" + result.summary.maximumElevationMeters + "m"} />
        <Metric icon={TrendingUp} label="Cumulative ascent" value={result.summary.cumulativeAscentMeters.toLocaleString() + "m"} />
        <Metric icon={Gauge} label="Routing profile" value="Driving car" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause route animation" : "Play route animation"}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</Button>
            <Button size="sm" variant="outline" onClick={() => { setPlaying(false); setProgress(0); }}><RefreshCcw size={15} /> Restart</Button>
            <label className="flex min-w-52 flex-1 items-center gap-3 text-xs font-bold"><span>Route progress</span><input className="w-full accent-[#173f35]" type="range" min={0} max={1000} value={Math.round(progress * 1000)} onChange={(event) => { setPlaying(false); setProgress(Number(event.target.value) / 1000); }} aria-label="Route progress" /></label>
          </div>
        </div>
        {mapUnavailable ? <div className="grid h-[460px] place-items-center bg-muted p-8 text-center text-muted-foreground"><div><MapPinned className="mx-auto" /><p className="mt-3">Interactive map unavailable. Use the route instructions below.</p></div></div> : <div ref={mapHost} className="h-[460px] bg-muted" aria-label="Package road route map" />}
      </Card>

      <Card className="p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow text-[#5a7f73]">Elevation profile</p><h3 className="mt-1 text-xl font-extrabold">How the road climbs</h3></div><p className="text-xs text-muted-foreground">Move across the chart or use the progress slider to inspect the route.</p></div>
        <div className="mt-5 h-64" tabIndex={0} aria-label={"Elevation ranges from " + result.summary.minimumElevationMeters + " to " + result.summary.maximumElevationMeters + " metres"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onMouseMove={(state) => { if (state?.activeTooltipIndex != null) { const index = Number(state.activeTooltipIndex); if (Number.isFinite(index)) { setPlaying(false); setProgress(index / Math.max(1, chartData.length - 1)); } } }}>
              <defs><linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#397668" stopOpacity={.7} /><stop offset="100%" stopColor="#397668" stopOpacity={.08} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,37,31,.12)" /><XAxis dataKey="distanceKm" unit=" km" tick={{ fontSize: 11 }} /><YAxis unit="m" width={54} tick={{ fontSize: 11 }} domain={["dataMin - 100", "dataMax + 100"]} /><Tooltip formatter={(value) => [Number(value).toLocaleString() + " m", "Elevation"]} labelFormatter={(value) => value + " km"} /><Area type="monotone" dataKey="elevationMeters" stroke="#173f35" strokeWidth={2} fill="url(#elevationFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-extrabold">Road instructions</h3>
        <ol className="mt-5 grid gap-3">{result.instructions.length ? result.instructions.map((item, index) => <li key={index} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 rounded-xl bg-muted p-3 text-sm"><span className="grid size-8 place-items-center rounded-full bg-white font-bold">{index + 1}</span><span className="pt-1.5">{item.instruction}</span><span className="pt-1.5 text-xs text-muted-foreground">{formatDistance(item.distanceMeters)}</span></li>) : <li className="text-sm text-muted-foreground">Turn-by-turn instructions were not returned, but the saved itinerary remains available.</li>}</ol>
        {result.waypoints.some((item) => item.requiresLocalTransport) && <div className="mt-5 flex gap-3 rounded-xl bg-[#fff4dc] p-4 text-sm text-[#725f42]"><AlertTriangle className="shrink-0" size={19} /><p>The road line is a regional driving estimate. Orange stops require separate local transport and may include jeep tracks or hiking that this route does not represent.</p></div>}
        <p className="mt-5 text-xs text-muted-foreground">Route and elevation © openrouteservice contributors. Map data © OpenStreetMap contributors.</p>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: string }) {
  return <Card className="p-4"><Icon size={17} className="text-[#397668]" /><p className="mt-4 text-lg font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></Card>;
}
