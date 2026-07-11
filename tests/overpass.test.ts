import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildSafetyQuery,
  overpassPayloadHasError,
  parseSafetyElements,
  OVERPASS_MIRRORS,
} from "../lib/overpass-core";

vi.mock("server-only", () => ({}));

describe("buildSafetyQuery", () => {
  it("uses nwr tags and the provided coordinates", () => {
    const query = buildSafetyQuery(36.314, 74.656, 35_000);
    expect(query).toContain('nwr["amenity"~"hospital|police|fuel"]');
    expect(query).toContain('nwr["shop"="car_repair"]');
    expect(query).toContain("(around:35000,36.314,74.656)");
    expect(query).not.toContain("barrier=checkpoint");
  });
});

describe("parseSafetyElements", () => {
  it("maps hospital, police, fuel, and mechanic tags", () => {
    const points = parseSafetyElements([
      { lat: 1, lon: 2, tags: { amenity: "hospital", name: "Civil Hospital" } },
      { center: { lat: 3, lon: 4 }, tags: { amenity: "police", operator: "Police Post" } },
      { lat: 5, lon: 6, tags: { amenity: "fuel", name: "Shell" } },
      { lat: 7, lon: 8, tags: { shop: "car_repair", name: "Auto Fix" } },
    ]);
    expect(points).toEqual([
      { type: "hospital", name: "Civil Hospital", latitude: 1, longitude: 2, phone: undefined },
      { type: "police", name: "Police Post", latitude: 3, longitude: 4, phone: undefined },
      { type: "petrol", name: "Shell", latitude: 5, longitude: 6, phone: undefined },
      { type: "mechanic", name: "Auto Fix", latitude: 7, longitude: 8, phone: undefined },
    ]);
  });

  it("skips elements without coordinates or known tags", () => {
    expect(parseSafetyElements([{ tags: { amenity: "cafe" } }, { lat: 1, lon: 2 }])).toEqual([]);
  });
});

describe("overpassPayloadHasError", () => {
  it("detects remark and error fields", () => {
    expect(overpassPayloadHasError({ remark: "Error: runtime error" })).toBe("Error: runtime error");
    expect(overpassPayloadHasError({ error: "Gateway timeout" })).toBe("Gateway timeout");
    expect(overpassPayloadHasError({ elements: [] })).toBeNull();
  });
});

describe("querySafetyPoints mirror fallback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("tries the second mirror when the first returns 504", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 504, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          elements: [{ lat: 36.3, lon: 74.6, tags: { amenity: "hospital", name: "Altit Clinic" } }],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { querySafetyPoints } = await import("../lib/overpass");
    const result = await querySafetyPoints(36.314, 74.656);

    expect(result).toEqual({
      mirror: OVERPASS_MIRRORS[1],
      points: [{ type: "hospital", name: "Altit Clinic", latitude: 36.3, longitude: 74.6, phone: undefined }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(OVERPASS_MIRRORS[0]);
    expect(fetchMock.mock.calls[1][0]).toBe(OVERPASS_MIRRORS[1]);
  });

  it("returns null when every mirror fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const { querySafetyPoints } = await import("../lib/overpass");
    expect(await querySafetyPoints(36.314, 74.656)).toBeNull();
  });
});
