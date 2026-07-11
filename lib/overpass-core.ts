export type SafetyPointResult = {
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  phone?: string;
};

export const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

export function buildSafetyQuery(latitude: number, longitude: number, radiusMeters: number) {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  return `[out:json][timeout:25];(nwr["amenity"~"hospital|police|fuel"]${around};nwr["shop"="car_repair"]${around};);out center qt 40;`;
}

export function classifySafetyTags(tags: Record<string, string>) {
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "police") return "police";
  if (tags.amenity === "fuel") return "petrol";
  if (tags.shop === "car_repair") return "mechanic";
  return null;
}

type OverpassElement = { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

export function parseSafetyElements(elements: OverpassElement[] | undefined) {
  const results: SafetyPointResult[] = [];
  for (const element of elements ?? []) {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat == null || lon == null) continue;
    const tags = element.tags ?? {};
    const type = classifySafetyTags(tags);
    if (!type) continue;
    results.push({
      type,
      name: tags.name ?? tags.operator ?? type,
      latitude: lat,
      longitude: lon,
      phone: tags.phone ?? tags["contact:phone"],
    });
  }
  return results.slice(0, 40);
}

export function overpassPayloadHasError(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Invalid Overpass response.";
  const body = payload as { remark?: string; error?: string; elements?: unknown[] };
  if (typeof body.remark === "string" && body.remark.length > 0) return body.remark;
  if (typeof body.error === "string" && body.error.length > 0) return body.error;
  if (!Array.isArray(body.elements)) return "Overpass response missing elements.";
  return null;
}
