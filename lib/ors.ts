import "server-only";
import type { PackageView } from "@/lib/data";
import { buildElevationProfile, elevationSummary } from "@/lib/route-math";
import type { RouteCoordinate, RouteErrorBody, RouteExtraSegment, RouteInstruction, RouteResult } from "@/lib/route-types";

export class RouteServiceError extends Error {
  constructor(public status: number, public body: RouteErrorBody) { super(body.message); }
}

export function validateRoutePackage(pkg: PackageView | null) {
  if (!pkg || !pkg.vendor.verified) throw serviceError(404, "PACKAGE_NOT_FOUND", "This public package was not found.", false);
  const distinct = new Set(pkg.stops.map((stop) => stop.destination.latitude + "," + stop.destination.longitude));
  if (pkg.stops.length < 2 || distinct.size < 2) throw serviceError(422, "ROUTE_NOT_POSSIBLE", "This package needs at least two distinct mapped stops.", false);
  return pkg;
}

function serviceError(status: number, code: RouteErrorBody["code"], message: string, retryable: boolean) {
  return new RouteServiceError(status, { code, message, retryable });
}

function normalizeCoordinates(value: unknown): RouteCoordinate[] {
  if (!Array.isArray(value)) throw serviceError(503, "SERVICE_UNAVAILABLE", "The routing service returned invalid geometry.", true);
  const coordinates = value.map((item) => {
    if (!Array.isArray(item) || item.length < 2 || !item.slice(0, 3).every((part) => typeof part === "number" && Number.isFinite(part))) throw serviceError(503, "SERVICE_UNAVAILABLE", "The routing service returned invalid geometry.", true);
    return [item[0], item[1], item[2] ?? 0] as RouteCoordinate;
  });
  if (coordinates.length < 2) throw serviceError(422, "ROUTE_NOT_POSSIBLE", "No usable road route was found for this package.", false);
  return coordinates;
}

function normalizeExtra(value: unknown): RouteExtraSegment[] {
  if (!value || typeof value !== "object") return [];
  const values = (value as { values?: unknown }).values;
  if (!Array.isArray(values)) return [];
  return values.flatMap((item) => Array.isArray(item) && item.length >= 3 && item.every(Number.isFinite) ? [{ fromIndex: item[0], toIndex: item[1], value: item[2] }] : []);
}

export function normalizeOrsRoute(payload: unknown, pkg: PackageView): RouteResult {
  const feature = (payload as { features?: Array<{ geometry?: { coordinates?: unknown }; properties?: Record<string, unknown> }> })?.features?.[0];
  if (!feature) throw serviceError(422, "ROUTE_NOT_POSSIBLE", "No road route was found between these package stops.", false);
  const coordinates = normalizeCoordinates(feature.geometry?.coordinates);
  const properties = feature.properties ?? {};
  const summary = properties.summary as { distance?: number; duration?: number } | undefined;
  const waypointIndices = Array.isArray(properties.way_points) ? properties.way_points.map(Number) : [];
  const segments = Array.isArray(properties.segments) ? properties.segments as Array<{ steps?: Array<Record<string, unknown>> }> : [];
  const instructions: RouteInstruction[] = segments.flatMap((segment) => (segment.steps ?? []).flatMap((step) => {
    const points = Array.isArray(step.way_points) ? step.way_points.map(Number) : [];
    if (typeof step.instruction !== "string" || points.length < 2) return [];
    return [{ instruction: step.instruction, distanceMeters: Number(step.distance ?? 0), durationSeconds: Number(step.duration ?? 0), fromIndex: points[0], toIndex: points[1] }];
  }));
  const extras = properties.extras as Record<string, unknown> | undefined;
  const elevation = elevationSummary(coordinates);
  return {
    geometry: { type: "LineString", coordinates },
    summary: { distanceMeters: Math.round(Number(summary?.distance ?? 0)), durationSeconds: Math.round(Number(summary?.duration ?? 0)), ...elevation },
    waypoints: pkg.stops.map((stop, index) => {
      const geometryIndex = Math.min(coordinates.length - 1, waypointIndices[index] ?? Math.round(index * (coordinates.length - 1) / Math.max(1, pkg.stops.length - 1)));
      return { index, dayNumber: stop.dayNumber, stopType: stop.stopType, destinationId: stop.destination.id, destinationName: stop.destination.name, destinationSlug: stop.destination.slug, coordinate: coordinates[geometryIndex], requiresLocalTransport: stop.destination.requiresLocalTransport };
    }),
    instructions,
    elevationProfile: buildElevationProfile(coordinates),
    extras: { surface: normalizeExtra(extras?.surface), steepness: normalizeExtra(extras?.steepness), waytype: normalizeExtra(extras?.waytype) },
    provider: "openrouteservice",
  };
}

export async function requestOrsRoute(pkg: PackageView) {
  if (!process.env.ORS_API_KEY) throw serviceError(503, "SERVICE_UNAVAILABLE", "Route visualization is not configured yet.", false);
  const coordinates = pkg.stops.map((stop) => [stop.destination.longitude, stop.destination.latitude]);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let response: Response;
  try {
    response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: { Authorization: process.env.ORS_API_KEY, "Content-Type": "application/json", Accept: "application/geo+json, application/json" },
      body: JSON.stringify({ coordinates, elevation: true, instructions: true, extra_info: ["surface", "steepness", "waytype"] }),
      signal: controller.signal,
    });
  } catch {
    throw serviceError(503, "SERVICE_UNAVAILABLE", "The routing service could not be reached.", true);
  } finally { clearTimeout(timeout); }
  if (response.status === 429) throw serviceError(429, "RATE_LIMITED", "Route requests are temporarily limited. Try again shortly.", true);
  if (response.status === 400 || response.status === 404) throw serviceError(422, "ROUTE_NOT_POSSIBLE", "No road route was found between these package stops.", false);
  if (!response.ok) throw serviceError(503, "SERVICE_UNAVAILABLE", "The routing service is temporarily unavailable.", true);
  return normalizeOrsRoute(await response.json(), pkg);
}
