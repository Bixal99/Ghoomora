import "server-only";
import { getDb } from "@/lib/db";

export async function getAnalyticsSnapshot() {
  const db = getDb();
  if (!db) return { bookingsByRegion: [], revenueTotal: 0, popularDestinations: [], bookingCount: 0 };
  const [bookings, stops] = await Promise.all([
    db.booking.findMany({ include: { package: { include: { stops: { include: { destination: { include: { region: true } } } } } } } }),
    db.packageStop.findMany({ include: { destination: true } }),
  ]);
  const regionCounts = new Map<string, number>();
  for (const booking of bookings) {
    const region = booking.package.stops[0]?.destination.region.name ?? "Unknown";
    regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1);
  }
  const destinationCounts = new Map<string, number>();
  for (const stop of stops) destinationCounts.set(stop.destination.name, (destinationCounts.get(stop.destination.name) ?? 0) + 1);
  return {
    bookingsByRegion: Array.from(regionCounts.entries()).map(([region, count]) => ({ region, count })),
    revenueTotal: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
    popularDestinations: Array.from(destinationCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
    bookingCount: bookings.length,
  };
}
