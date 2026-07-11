import { afterEach, describe, expect, it, vi } from "vitest";
import type { DestinationView, PackageView } from "../lib/data";
import { buildElevationProfile, elevationSummary, interpolateRouteCoordinate } from "../lib/route-math";
import { normalizeOrsRoute, requestOrsRoute, RouteServiceError, validateRoutePackage } from "../lib/ors";

vi.mock("server-only", () => ({}));

const region = { id: "gb", name: "Gilgit-Baltistan", slug: "gilgit-baltistan" };
function destination(id: string, longitude: number, latitude: number, local = false): DestinationView {
  return { id, name: id, slug: id, longitude, latitude, elevationMeters: 2000, difficulty: "moderate", description: id, bestSeasonStart: 4, bestSeasonEnd: 10, requiresLocalTransport: local, localTransportNote: null, heroImageUrl: null, region };
}
const first = destination("hunza", 74.65, 36.3167);
const second = destination("attabad", 74.8666, 36.3654, true);
const pkg: PackageView = {
  id: "package-1", title: "Hunza", description: "Trip", minDays: 4, maxDays: 6,
  vendor: { businessName: "Verified", verified: true }, tiers: [],
  stops: [{ dayNumber: 1, stopType: "overnight", destination: first }, { dayNumber: 3, stopType: "viewpoint", destination: second }],
};

const orsPayload = {
  features: [{
    geometry: { coordinates: [[74.65, 36.3167, 2400], [74.72, 36.34, 2600], [74.8666, 36.3654, 2550]] },
    properties: {
      summary: { distance: 24000.4, duration: 3600.2 }, way_points: [0, 2],
      segments: [{ steps: [{ instruction: "Head east", distance: 12000, duration: 1800, way_points: [0, 1] }] }],
      extras: { surface: { values: [[0, 2, 1]] }, steepness: { values: [[0, 1, 2]] }, waytype: { values: [[0, 2, 3]] } },
    },
  }],
};

describe("route normalization", () => {
  it("normalizes 3D geometry, instructions, waypoints, and extras", () => {
    const result = normalizeOrsRoute(orsPayload, pkg);
    expect(result.geometry.coordinates[1]).toEqual([74.72, 36.34, 2600]);
    expect(result.summary).toMatchObject({ distanceMeters: 24000, durationSeconds: 3600, minimumElevationMeters: 2400, maximumElevationMeters: 2600, cumulativeAscentMeters: 200 });
    expect(result.instructions[0].instruction).toBe("Head east");
    expect(result.waypoints[1]).toMatchObject({ destinationName: "attabad", requiresLocalTransport: true, coordinate: [74.8666, 36.3654, 2550] });
    expect(result.extras.surface[0]).toEqual({ fromIndex: 0, toIndex: 2, value: 1 });
  });
  it("rejects malformed and empty geometry", () => {
    expect(() => normalizeOrsRoute({ features: [{ geometry: { coordinates: [] }, properties: {} }] }, pkg)).toThrow(RouteServiceError);
    expect(() => normalizeOrsRoute({ features: [{ geometry: { coordinates: [["bad"]] }, properties: {} }] }, pkg)).toThrow(/invalid geometry/);
  });
});

describe("route calculations", () => {
  const coordinates: [number, number, number][] = [[74, 36, 1000], [74.1, 36, 1200], [74.2, 36, 1100], [74.3, 36, 1400]];
  it("calculates elevation profile and ascent", () => {
    expect(elevationSummary(coordinates)).toEqual({ minimumElevationMeters: 1000, maximumElevationMeters: 1400, cumulativeAscentMeters: 500 });
    expect(buildElevationProfile(coordinates, 2).at(-1)?.coordinateIndex).toBe(3);
  });
  it("interpolates by route distance and clamps progress", () => {
    expect(interpolateRouteCoordinate(coordinates, 0)).toEqual(coordinates[0]);
    expect(interpolateRouteCoordinate(coordinates, 1)).toEqual(coordinates.at(-1));
    const midpoint = interpolateRouteCoordinate(coordinates, .5);
    expect(midpoint[0]).toBeGreaterThan(74.1);
    expect(midpoint[0]).toBeLessThan(74.2);
  });
});

describe("route package and provider failures", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.ORS_API_KEY; });
  it("rejects missing, unverified, and single-stop packages", () => {
    expect(() => validateRoutePackage(null)).toThrow(RouteServiceError);
    expect(() => validateRoutePackage({ ...pkg, vendor: { ...pkg.vendor, verified: false } })).toThrow(/not found/);
    expect(() => validateRoutePackage({ ...pkg, stops: [pkg.stops[0]] })).toThrow(/two distinct/);
  });
  it("does not call the provider without a key", async () => {
    await expect(requestOrsRoute(pkg)).rejects.toMatchObject({ status: 503, body: { retryable: false } });
  });
  it("maps provider rate limits without exposing details", async () => {
    process.env.ORS_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("limited", { status: 429 })));
    await expect(requestOrsRoute(pkg)).rejects.toMatchObject({ status: 429, body: { code: "RATE_LIMITED", retryable: true } });
  });
});
