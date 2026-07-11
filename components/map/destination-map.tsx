"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import type { DestinationView } from "@/lib/data";
import type { TravelRisk, WeatherForecast } from "@/lib/route-types";

function popupHtml(destination: DestinationView, forecast?: WeatherForecast | null) {
  const today = forecast?.days[0];
  const risk = today?.risk;
  const riskLabel = risk?.level === "SEVERE" ? "Possible closure risk" : risk?.level === "CAUTION" ? "Travel caution" : "Normal conditions";
  const riskColor = risk?.level === "SEVERE" ? "#b42318" : risk?.level === "CAUTION" ? "#8a5d1d" : "#397668";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:180px">
      <strong>${destination.name}</strong><br/>
      <span>${destination.elevationMeters.toLocaleString()}m · ${destination.difficulty ?? "unrated"}</span><br/>
      ${destination.requiresLocalTransport ? '<span style="color:#b66b25;font-weight:700">Local 4x4 required</span><br/>' : ""}
      ${today ? `<span style="color:${riskColor};font-weight:700">${riskLabel}</span>` : "<span>Weather loading unavailable</span>"}
      ${today?.temperatureMaxC != null ? `<br/><span>${today.temperatureMinC}–${today.temperatureMaxC}°C</span>` : ""}
    </div>`;
}

export function DestinationMap({
  destinations,
  forecasts = [],
}: {
  destinations: DestinationView[];
  forecasts?: (WeatherForecast | null)[];
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    let map: maplibregl.Map;
    const forecastById = Object.fromEntries(forecasts.filter(Boolean).map((item) => [item!.destinationId, item]));
    try {
      map = new maplibregl.Map({
        container: host.current,
        style: {
          version: 8,
          sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [73.8, 35.3],
        zoom: 5.2,
        attributionControl: {},
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      destinations.forEach((destination) => {
        const forecast = forecastById[destination.id] ?? null;
        const risk: TravelRisk | undefined = forecast?.days[0]?.risk;
        const marker = document.createElement("button");
        marker.className = "size-4 rounded-full border-2 border-white shadow-lg " + (destination.requiresLocalTransport ? "bg-[#b66b25]" : risk?.level === "SEVERE" ? "bg-[#b42318]" : "bg-[#e7a94e]");
        marker.setAttribute("aria-label", destination.name);
        new maplibregl.Marker({ element: marker })
          .setLngLat([destination.longitude, destination.latitude])
          .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml(destination, forecast)))
          .addTo(map);
      });
    } catch {
      if (host.current) host.current.textContent = "The map could not load. Use the complete destination list below.";
      return;
    }
    return () => map.remove();
  }, [destinations, forecasts]);

  return (
    <div>
      <div ref={host} className="h-[440px] overflow-hidden rounded-[2rem] border bg-muted" aria-label="Destination map" />
      <div className="sr-only" aria-label="Map destination alternative">
        {destinations.map((item) => <Link key={item.slug} href={"/destinations/" + item.slug}>{item.name}</Link>)}
      </div>
    </div>
  );
}
