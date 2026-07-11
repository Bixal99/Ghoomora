import type { ElevationSample, RouteCoordinate } from "@/lib/route-types";

const EARTH_RADIUS_METERS = 6_371_000;

export function distanceMeters(a: readonly number[], b: readonly number[]) {
  const toRadians = (value: number) => value * Math.PI / 180;
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(b[0] - a[0]);
  const value = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(value));
}

export function cumulativeDistances(coordinates: RouteCoordinate[]) {
  const values = [0];
  for (let index = 1; index < coordinates.length; index += 1) values.push(values[index - 1] + distanceMeters(coordinates[index - 1], coordinates[index]));
  return values;
}

export function buildElevationProfile(coordinates: RouteCoordinate[], maximumSamples = 240): ElevationSample[] {
  if (!coordinates.length) return [];
  const distances = cumulativeDistances(coordinates);
  const stride = Math.max(1, Math.ceil(coordinates.length / maximumSamples));
  const samples = coordinates.flatMap((coordinate, index) => index % stride === 0 ? [{ coordinateIndex: index, distanceMeters: Math.round(distances[index]), elevationMeters: Math.round(coordinate[2]) }] : []);
  const lastIndex = coordinates.length - 1;
  if (samples.at(-1)?.coordinateIndex !== lastIndex) samples.push({ coordinateIndex: lastIndex, distanceMeters: Math.round(distances[lastIndex]), elevationMeters: Math.round(coordinates[lastIndex][2]) });
  return samples;
}

export function elevationSummary(coordinates: RouteCoordinate[]) {
  if (!coordinates.length) return { minimumElevationMeters: 0, maximumElevationMeters: 0, cumulativeAscentMeters: 0 };
  const elevations = coordinates.map((item) => item[2]);
  let cumulativeAscentMeters = 0;
  for (let index = 1; index < elevations.length; index += 1) if (elevations[index] > elevations[index - 1]) cumulativeAscentMeters += elevations[index] - elevations[index - 1];
  return { minimumElevationMeters: Math.round(Math.min(...elevations)), maximumElevationMeters: Math.round(Math.max(...elevations)), cumulativeAscentMeters: Math.round(cumulativeAscentMeters) };
}

export function interpolateRouteCoordinate(coordinates: RouteCoordinate[], progress: number): RouteCoordinate {
  if (!coordinates.length) return [0, 0, 0];
  if (coordinates.length === 1) return coordinates[0];
  const distances = cumulativeDistances(coordinates);
  const target = Math.max(0, Math.min(1, progress)) * distances.at(-1)!;
  let nextIndex = distances.findIndex((value) => value >= target);
  if (nextIndex <= 0) return coordinates[0];
  if (nextIndex === -1) nextIndex = coordinates.length - 1;
  const previousIndex = nextIndex - 1;
  const segment = distances[nextIndex] - distances[previousIndex];
  const ratio = segment === 0 ? 0 : (target - distances[previousIndex]) / segment;
  const start = coordinates[previousIndex];
  const end = coordinates[nextIndex];
  return [start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio, start[2] + (end[2] - start[2]) * ratio];
}
