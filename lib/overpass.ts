import "server-only";

export type SafetyPointResult = {
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  phone?: string;
};

function classify(tags: Record<string, string>) {
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "police") return "police";
  if (tags.amenity === "fuel") return "petrol";
  if (tags.shop === "car_repair") return "mechanic";
  if (tags.barrier === "checkpoint") return "checkpoint";
  return null;
}

export async function querySafetyPoints(latitude: number, longitude: number, radiusMeters = 50_000): Promise<SafetyPointResult[]> {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  const query = `[out:json][timeout:25];(node["amenity"="hospital"]${around};node["amenity"="police"]${around};node["amenity"="fuel"]${around};node["shop"="car_repair"]${around};node["barrier"="checkpoint"]${around};);out center 40;`;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("Overpass API unavailable.");
  const payload = await response.json() as { elements?: Array<{ lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> };
  const results: SafetyPointResult[] = [];
  for (const element of payload.elements ?? []) {
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat == null || lon == null) continue;
    const tags = element.tags ?? {};
    const type = classify(tags);
    if (!type) continue;
    results.push({ type, name: tags.name ?? tags.operator ?? type, latitude: lat, longitude: lon, phone: tags.phone ?? tags["contact:phone"] });
  }
  return results.slice(0, 40);
}
