"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import type { DestinationView } from "@/lib/data";

export function DestinationMap({ destinations }: { destinations: DestinationView[] }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: host.current,
        style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
        center: [73.8, 35.3], zoom: 5.2, attributionControl: {},
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      destinations.forEach((destination) => {
        const marker = document.createElement("button");
        marker.className = "size-4 rounded-full border-2 border-white bg-[#e7a94e] shadow-lg";
        marker.setAttribute("aria-label", destination.name);
        new maplibregl.Marker({ element: marker }).setLngLat([destination.longitude, destination.latitude]).setPopup(new maplibregl.Popup({ offset: 18 }).setHTML("<strong>" + destination.name + "</strong><br>" + destination.elevationMeters.toLocaleString() + "m · " + (destination.difficulty ?? "unrated"))).addTo(map);
      });
    } catch {
      if (host.current) host.current.textContent = "The map could not load. Use the complete destination list below.";
      return;
    }
    return () => map.remove();
  }, [destinations]);
  return (
    <div>
      <div ref={host} className="h-[440px] overflow-hidden rounded-[2rem] border bg-muted" aria-label="Destination map" />
      <div className="sr-only" aria-label="Map destination alternative">{destinations.map((item) => <Link key={item.slug} href={"/destinations/" + item.slug}>{item.name}</Link>)}</div>
    </div>
  );
}
