"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Pusher from "pusher-js";
import { Card } from "@/components/ui/card";

type TrackingPoint = { latitude: number; longitude: number; updatedAt: string };

export function LiveTrackingMap({ bookingId, enabled }: { bookingId: string; enabled: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [latest, setLatest] = useState<TrackingPoint | null>(null);
  const [status, setStatus] = useState("Waiting for live location updates…");

  useEffect(() => {
    if (!enabled || !host.current) return;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (!key) { setStatus("Live tracking is not configured. Set Pusher env vars to enable."); return; }
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: host.current,
        style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256 } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
        center: [74.35, 35.9],
        zoom: 6,
      });
    } catch { setStatus("Map unavailable for live tracking."); return; }

    const pusher = new Pusher(key, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2" });
    const channel = pusher.subscribe("booking-" + bookingId);
    channel.bind("location", (payload: TrackingPoint) => {
      setLatest(payload);
      setStatus("Last update " + new Date(payload.updatedAt).toLocaleTimeString());
      const coordinate: [number, number] = [payload.longitude, payload.latitude];
      if (!markerRef.current) {
        const element = document.createElement("div");
        element.className = "size-4 rounded-full border-2 border-white bg-[#e7a94e] shadow-lg";
        markerRef.current = new maplibregl.Marker({ element }).setLngLat(coordinate).addTo(map);
        map.flyTo({ center: coordinate, zoom: 9 });
      } else markerRef.current.setLngLat(coordinate);
    });

    return () => { pusher.unsubscribe("booking-" + bookingId); pusher.disconnect(); map.remove(); markerRef.current = null; };
  }, [bookingId, enabled]);

  if (!enabled) return null;
  return (
    <Card className="mt-6 p-7">
      <p className="eyebrow text-[#5a7f73]">Live trip tracking</p>
      <h2 className="text-xl font-extrabold">In-progress location</h2>
      <p className="mt-2 text-sm text-muted-foreground">{status}</p>
      <div ref={host} className="mt-5 h-72 overflow-hidden rounded-2xl border bg-muted" />
      {latest && <p className="mt-3 text-xs text-muted-foreground">Lat {latest.latitude.toFixed(4)}, Lng {latest.longitude.toFixed(4)}</p>}
    </Card>
  );
}
