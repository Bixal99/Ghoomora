"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { AlertTriangle, Gauge, MapPinned, Mountain, Pause, Play, RefreshCcw, Route, Timer, TrendingUp } from "lucide-react";
import { ElevationChart } from "@/components/map/elevation-chart";
import type { RouteErrorBody, RouteResult, TravelRisk } from "@/lib/route-types";
import { interpolateRouteCoordinate } from "@/lib/route-math";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ANIMATION_DURATION = 22_000;

function formatDistance(value: number) { return value >= 1000 ? Math.round(value / 1000).toLocaleString() + " km" : Math.round(value) + " m"; }
function formatDuration(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.round((value % 3600) / 60);
  return hours ? hours + "h " + minutes + "m" : minutes + "m";
}

export function RouteExperience({
  packageId,
  weatherRisks = {},
}: {
  packageId: string;
  weatherRisks?: Record<string, TravelRisk>;
}) {
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
        map.addLayer({ id: "route-shadow", type: "line", source: "route", paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.7 } });
        map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#173f35", "line-width": 5 } });
        const bounds = new maplibregl.LngLatBounds();
        result.geometry.coordinates.forEach((coordinate) => bounds.extend([coordinate[0], coordinate[1]]));
        map.fitBounds(bounds, { padding: 54, maxZoom: 10, duration: reducedMotion ? 0 : 900 });
        result.waypoints.forEach((waypoint) => {
          const risk = weatherRisks[waypoint.destinationId];
          const element = document.createElement("button");
          element.className = "grid size-9 place-items-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-lg " + (waypoint.requiresLocalTransport ? "bg-[#b66b25]" : risk?.level === "SEVERE" ? "bg-[#b42318]" : "bg-[#173f35]");
          element.textContent = String(waypoint.dayNumber);
          const riskNote = risk?.level === "SEVERE" ? " · possible closure risk" : "";
          element.setAttribute("aria-label", "Day " + waypoint.dayNumber + ": " + waypoint.destinationName);
          new maplibregl.Marker({ element }).setLngLat([waypoint.coordinate[0], waypoint.coordinate[1]]).setPopup(new maplibregl.Popup({ offset: 20 }).setText(waypoint.destinationName + " · " + waypoint.stopType + (waypoint.requiresLocalTransport ? " · local transport required" : "") + riskNote)).addTo(map);
        });
        const travelElement = document.createElement("div");
        travelElement.className = "grid size-8 place-items-center rounded-full border-4 border-white bg-[#e7a94e] text-[#173f35] shadow-xl";
        travelElement.innerHTML = "●";
        travelMarker.current = new maplibregl.Marker({ element: travelElement }).setLngLat(result.geometry.coordinates[0].slice(0, 2) as [number, number]).addTo(map);
      });
    } catch { queueMicrotask(() => setMapUnavailable(true)); return; }
    return () => { map.remove(); mapRef.current = null; travelMarker.current = null; };
  }, [result, reducedMotion, weatherRisks]);

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

  const severeWaypoints = result.waypoints.filter((waypoint) => weatherRisks[waypoint.destinationId]?.level === "SEVERE");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric icon={Route} label="Road distance" value={formatDistance(result.summary.distanceMeters)} />
        <Metric icon={Timer} label="Driving estimate" value={formatDuration(result.summary.durationSeconds)} />
        <Metric icon={Mountain} label="Elevation" value={result.summary.minimumElevationMeters + "–" + result.summary.maximumElevationMeters + "m"} />
        <Metric icon={TrendingUp} label="Cumulative ascent" value={result.summary.cumulativeAscentMeters.toLocaleString() + "m"} />
        <Metric icon={Gauge} label="Routing profile" value="Driving car" />
      </div>

      {severeWaypoints.length > 0 && (
        <Card className="border-[#fecdca] bg-[#fef3f2] p-5">
          <div className="flex gap-3"><AlertTriangle className="shrink-0 text-[#b42318]" /><div><h3 className="font-extrabold text-[#b42318]">Possible closure risk on {severeWaypoints.length} stop{severeWaypoints.length > 1 ? "s" : ""}</h3><p className="mt-2 text-sm text-[#7a271a]">Model-based severe weather advisories: {severeWaypoints.map((item) => item.destinationName).join(", ")}. This is not a confirmed road closure.</p></div></div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="border-b bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</Button>
            <Button size="sm" variant="outline" onClick={() => { setPlaying(false); setProgress(0); }}><RefreshCcw size={15} /> Restart</Button>
            <label className="flex min-w-52 flex-1 items-center gap-3 text-xs font-bold"><span>Route progress</span><input className="w-full accent-[#173f35]" type="range" min={0} max={1000} value={Math.round(progress * 1000)} onChange={(event) => { setPlaying(false); setProgress(Number(event.target.value) / 1000); }} /></label>
          </div>
        </div>
        {mapUnavailable ? <div className="grid h-[460px] place-items-center bg-muted p-8 text-center text-muted-foreground"><MapPinned className="mx-auto" /><p className="mt-3">Interactive map unavailable.</p></div> : <div ref={mapHost} className="h-[460px] bg-muted" />}
      </Card>

      <Card className="p-5 md:p-7">
        <p className="eyebrow text-[#5a7f73]">Elevation profile</p>
        <h3 className="mt-1 text-xl font-extrabold">How the road climbs</h3>
        <div className="mt-5">
          <ElevationChart data={result.elevationProfile} minElevation={result.summary.minimumElevationMeters} maxElevation={result.summary.maximumElevationMeters} onProgressChange={(value) => { setPlaying(false); setProgress(value); }} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-extrabold">Waypoint summary</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.waypoints.map((waypoint) => {
            const risk = weatherRisks[waypoint.destinationId];
            return (
              <Badge key={waypoint.destinationId} className={risk?.level === "SEVERE" ? "border-[#b42318] bg-[#fef3f2] text-[#b42318]" : waypoint.requiresLocalTransport ? "border-[#b66b25] bg-[#fff4dc] text-[#8a5d1d]" : ""}>
                Day {waypoint.dayNumber}: {waypoint.destinationName}{risk?.level === "SEVERE" ? " · closure risk" : ""}
              </Badge>
            );
          })}
        </div>
        <h3 className="mt-8 text-xl font-extrabold">Road instructions</h3>
        <ol className="mt-5 grid gap-3">{result.instructions.length ? result.instructions.map((item, index) => <li key={index} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 rounded-xl bg-muted p-3 text-sm"><span className="grid size-8 place-items-center rounded-full bg-white font-bold">{index + 1}</span><span className="pt-1.5">{item.instruction}</span><span className="pt-1.5 text-xs text-muted-foreground">{formatDistance(item.distanceMeters)}</span></li>) : <li className="text-sm text-muted-foreground">Turn-by-turn instructions were not returned.</li>}</ol>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: string }) {
  return <Card className="p-4"><Icon size={17} className="text-[#397668]" /><p className="mt-4 text-lg font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></Card>;
}
