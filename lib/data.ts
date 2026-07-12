import "server-only";
import { getDb } from "@/lib/db";
import { destinationSeed, pickupCitySeed, regionSeed } from "@/prisma/seed-data";
import { SAMPLE_PACKAGE_TITLE } from "@/prisma/seed-artifacts";

export type DestinationView = {
  id: string; name: string; slug: string; latitude: number; longitude: number;
  elevationMeters: number; difficulty: string | null; description: string;
  bestSeasonStart: number; bestSeasonEnd: number; requiresLocalTransport: boolean;
  localTransportNote: string | null; heroImageUrl: string | null;
  region: { id: string; name: string; slug: string };
};
export type RegionView = { id: string; name: string; slug: string; blurb: string; destinations: DestinationView[] };
export type TierView = { id: string; tier: "STANDARD" | "MODERATE" | "LUXURY"; vehicleType: string; transportMode: string; pricePerPersonPerDay: number; hotelTier: string; includesGuide: boolean };
export type PackageView = { id: string; title: string; description: string; minDays: number; maxDays: number; vendor: { businessName: string; verified: boolean }; tiers: TierView[]; stops: { dayNumber: number; stopType: string; destination: DestinationView }[] };

function fallbackRegions(): RegionView[] {
  return regionSeed.map((region) => {
    const regionRef = { id: region.slug, name: region.name, slug: region.slug };
    return {
      ...regionRef,
      blurb: region.blurb,
      destinations: destinationSeed.filter((item) => item.regionSlug === region.slug).map((item) => ({
        id: item.slug, name: item.name, slug: item.slug, latitude: item.latitude, longitude: item.longitude,
        elevationMeters: item.elevationMeters, difficulty: item.difficulty, description: item.description,
        bestSeasonStart: item.bestSeasonStart, bestSeasonEnd: item.bestSeasonEnd,
        requiresLocalTransport: item.requiresLocalTransport ?? false,
        localTransportNote: item.localTransportNote ?? null, heroImageUrl: null, region: regionRef,
      })),
    };
  });
}

function isMissingDatabaseSchema(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return candidate.code === "P2021" || (typeof candidate.message === "string" && candidate.message.includes("does not exist in the current database"));
}

async function withSchemaFallback<T>(query: () => Promise<T>, fallback: () => T) {
  try {
    return await query();
  } catch (error) {
    if (isMissingDatabaseSchema(error)) return fallback();
    throw error;
  }
}

const fallbackTiers: TierView[] = [
  { id: "sample-standard", tier: "STANDARD", vehicleType: "COASTER", transportMode: "SHARED", pricePerPersonPerDay: 9500, hotelTier: "BUDGET", includesGuide: false },
  { id: "sample-moderate", tier: "MODERATE", vehicleType: "CAR", transportMode: "PRIVATE", pricePerPersonPerDay: 16500, hotelTier: "MID", includesGuide: false },
  { id: "sample-luxury", tier: "LUXURY", vehicleType: "COASTER", transportMode: "PRIVATE", pricePerPersonPerDay: 28500, hotelTier: "LUXURY", includesGuide: true },
];

function fallbackPackages(): PackageView[] {
  const regions = fallbackRegions();
  const find = (slug: string) => regions.flatMap((region) => region.destinations).find((destination) => destination.slug === slug)!;
  return [
    { id: "sample-hunza", title: SAMPLE_PACKAGE_TITLE, description: "Forts, glacial water and upper-Hunza horizons in one unhurried journey.", minDays: 5, maxDays: 8, vendor: { businessName: "Northbound Expeditions — Sample", verified: true }, tiers: fallbackTiers, stops: [{ dayNumber: 1, stopType: "overnight", destination: find("hunza-valley") }, { dayNumber: 3, stopType: "viewpoint", destination: find("attabad-lake") }, { dayNumber: 5, stopType: "viewpoint", destination: find("passu-cones") }] },
    { id: "sample-deosai", title: "Skardu to Deosai — Sample", description: "A high-plateau escape with a required local 4x4 day-hire shown separately.", minDays: 4, maxDays: 6, vendor: { businessName: "Northbound Expeditions — Sample", verified: true }, tiers: fallbackTiers, stops: [{ dayNumber: 1, stopType: "overnight", destination: find("skardu") }, { dayNumber: 3, stopType: "viewpoint", destination: find("deosai-sheosar-lake") }] },
    { id: "sample-neelum", title: "Upper Neelum — Sample", description: "A green-valley route from Muzaffarabad to Kel and Arang Kel.", minDays: 4, maxDays: 7, vendor: { businessName: "Northbound Expeditions — Sample", verified: true }, tiers: fallbackTiers, stops: [{ dayNumber: 1, stopType: "overnight", destination: find("neelum-valley") }, { dayNumber: 4, stopType: "viewpoint", destination: find("arang-kel") }] },
  ];
}

export async function getRegions() {
  const db = getDb();
  if (!db) return fallbackRegions();
  return withSchemaFallback(async () => {
    const rows = await db.region.findMany({ include: { destinations: { include: { region: true }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } });
    return rows.map((row) => ({ ...row, blurb: regionSeed.find((seed) => seed.slug === row.slug)?.blurb ?? "Discover the region with Ghoomora." })) as RegionView[];
  }, fallbackRegions);
}

export async function getRegion(slug: string) { return (await getRegions()).find((region) => region.slug === slug) ?? null; }
export async function getDestination(slug: string) { return (await getRegions()).flatMap((region) => region.destinations).find((destination) => destination.slug === slug) ?? null; }

export async function getPackages(): Promise<PackageView[]> {
  const db = getDb();
  if (!db) return fallbackPackages();
  return withSchemaFallback(
    () => db.package.findMany({ where: { vendor: { verified: true } }, include: { vendor: { select: { businessName: true, verified: true } }, tiers: { orderBy: { pricePerPersonPerDay: "asc" } }, stops: { include: { destination: { include: { region: true } } }, orderBy: { dayNumber: "asc" } } }, orderBy: { title: "asc" } }) as unknown as Promise<PackageView[]>,
    fallbackPackages,
  );
}

export async function getPackage(id: string) { return (await getPackages()).find((item) => item.id === id) ?? null; }

export async function getPackagesForDestination(destinationSlug: string): Promise<PackageView[]> {
  const db = getDb();
  const fallback = () => fallbackPackages().filter((item) => item.stops.some((stop) => stop.destination.slug === destinationSlug));
  if (!db) return fallback();
  return withSchemaFallback(
    () =>
      db.package.findMany({
        where: { vendor: { verified: true }, stops: { some: { destination: { slug: destinationSlug } } } },
        include: {
          vendor: { select: { businessName: true, verified: true } },
          tiers: { orderBy: { pricePerPersonPerDay: "asc" } },
          stops: { include: { destination: { include: { region: true } } }, orderBy: { dayNumber: "asc" } },
        },
        orderBy: { title: "asc" },
      }) as unknown as Promise<PackageView[]>,
    fallback,
  );
}
export async function getPickupCities() {
  const db = getDb();
  if (!db) return pickupCitySeed.map((city) => ({ ...city, id: city.slug }));
  return withSchemaFallback(() => db.pickupCity.findMany({ orderBy: { name: "asc" } }), () => pickupCitySeed.map((city) => ({ ...city, id: city.slug })));
}
