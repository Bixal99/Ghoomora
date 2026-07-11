import "server-only";
import {
  OVERPASS_MIRRORS,
  buildSafetyQuery,
  overpassPayloadHasError,
  parseSafetyElements,
  type SafetyPointResult,
} from "@/lib/overpass-core";

export type { SafetyPointResult } from "@/lib/overpass-core";
export { buildSafetyQuery, parseSafetyElements } from "@/lib/overpass-core";

const ATTEMPT_TIMEOUT_MS = 12_000;

async function fetchMirror(mirror: string, query: string) {
  const response = await fetch(mirror, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Ghoomora/1.0 (safety lookup)",
    },
    body: "data=" + encodeURIComponent(query),
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Overpass mirror ${mirror} returned ${response.status}.`);
  const payload = await response.json();
  const error = overpassPayloadHasError(payload);
  if (error) throw new Error(error);
  return { points: parseSafetyElements((payload as { elements?: Parameters<typeof parseSafetyElements>[0] }).elements), mirror };
}

export async function querySafetyPoints(
  latitude: number,
  longitude: number,
  radiusMeters = 35_000,
): Promise<{ points: SafetyPointResult[]; mirror: string } | null> {
  const query = buildSafetyQuery(latitude, longitude, radiusMeters);
  const failures: string[] = [];

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      return await fetchMirror(mirror, query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Overpass failure.";
      failures.push(`${mirror}: ${message}`);
    }
  }

  console.error(JSON.stringify({ scope: "overpass-safety", latitude, longitude, failures }));
  return null;
}
