import "server-only";
import { getDb } from "@/lib/db";

export type DestinationView = {
  id: string; name: string; slug: string; latitude: number; longitude: number;
  elevationMeters: number; difficulty: string | null; description: string;
  bestSeasonStart: number; bestSeasonEnd: number; requiresLocalTransport: boolean;
  localTransportNote: string | null; heroImageUrl: string | null;
  region: { id: string; name: string; slug: string };
};
export type RegionView = {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  destinations: DestinationView[];
};
export type TierView = { id: string; tier: "STANDARD" | "MODERATE" | "LUXURY"; vehicleType: string; transportMode: string; pricePerPersonPerDay: number; hotelTier: string; includesGuide: boolean };
export type PackageView = { id: string; title: string; description: string; minDays: number; maxDays: number; vendor: { businessName: string; verified: boolean }; tiers: TierView[]; stops: { dayNumber: number; stopType: string; destination: DestinationView }[] };

export type CatalogLoad<T> = { status: "setup" } | { status: "ready"; data: T };

export class CatalogSetupError extends Error {
  constructor(message = "Database is not configured or the schema is not migrated.") {
    super(message);
    this.name = "CatalogSetupError";
  }
}

export function isCatalogSetupError(error: unknown): error is CatalogSetupError {
  return error instanceof CatalogSetupError;
}

function isMissingDatabaseSchema(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return candidate.code === "P2021" || (typeof candidate.message === "string" && candidate.message.includes("does not exist in the current database"));
}

async function queryCatalog<T>(query: () => Promise<T>): Promise<CatalogLoad<T>> {
  const db = getDb();
  if (!db) return { status: "setup" };
  try {
    return { status: "ready", data: await query() };
  } catch (error) {
    if (isMissingDatabaseSchema(error)) return { status: "setup" };
    throw error;
  }
}

function mapRegion(row: {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  destinations: Array<{
    id: string;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    elevationMeters: number;
    difficulty: string | null;
    description: string;
    bestSeasonStart: number;
    bestSeasonEnd: number;
    requiresLocalTransport: boolean;
    localTransportNote: string | null;
    heroImageUrl: string | null;
    region: { id: string; name: string; slug: string };
  }>;
}): RegionView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    blurb: row.blurb,
    destinations: row.destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
      latitude: destination.latitude,
      longitude: destination.longitude,
      elevationMeters: destination.elevationMeters,
      difficulty: destination.difficulty,
      description: destination.description,
      bestSeasonStart: destination.bestSeasonStart,
      bestSeasonEnd: destination.bestSeasonEnd,
      requiresLocalTransport: destination.requiresLocalTransport,
      localTransportNote: destination.localTransportNote,
      heroImageUrl: destination.heroImageUrl,
      region: destination.region,
    })),
  };
}

export async function loadRegions(): Promise<CatalogLoad<RegionView[]>> {
  return queryCatalog(async () => {
    const db = getDb()!;
    const rows = await db.region.findMany({
      include: { destinations: { include: { region: true }, orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });
    return rows.map(mapRegion);
  });
}

export async function getRegions(): Promise<RegionView[]> {
  const result = await loadRegions();
  if (result.status === "setup") throw new CatalogSetupError();
  return result.data;
}

export async function getRegion(slug: string) {
  return (await getRegions()).find((region) => region.slug === slug) ?? null;
}

export async function getDestination(slug: string) {
  return (await getRegions()).flatMap((region) => region.destinations).find((destination) => destination.slug === slug) ?? null;
}

const packageInclude = {
  vendor: { select: { businessName: true, verified: true } },
  tiers: { orderBy: { pricePerPersonPerDay: "asc" as const } },
  stops: { include: { destination: { include: { region: true } } }, orderBy: { dayNumber: "asc" as const } },
};

export async function loadPackages(): Promise<CatalogLoad<PackageView[]>> {
  return queryCatalog(async () => {
    const db = getDb()!;
    return db.package.findMany({
      where: { vendor: { verified: true } },
      include: packageInclude,
      orderBy: { title: "asc" },
    }) as unknown as PackageView[];
  });
}

export async function getPackages(): Promise<PackageView[]> {
  const result = await loadPackages();
  if (result.status === "setup") throw new CatalogSetupError();
  return result.data;
}

export async function getPackage(id: string) {
  return (await getPackages()).find((item) => item.id === id) ?? null;
}

export async function loadPackagesForDestination(destinationSlug: string): Promise<CatalogLoad<PackageView[]>> {
  return queryCatalog(async () => {
    const db = getDb()!;
    return db.package.findMany({
      where: { vendor: { verified: true }, stops: { some: { destination: { slug: destinationSlug } } } },
      include: packageInclude,
      orderBy: { title: "asc" },
    }) as unknown as PackageView[];
  });
}

export async function getPackagesForDestination(destinationSlug: string): Promise<PackageView[]> {
  const result = await loadPackagesForDestination(destinationSlug);
  if (result.status === "setup") throw new CatalogSetupError();
  return result.data;
}

export async function loadPickupCities(): Promise<CatalogLoad<Array<{ id: string; name: string; slug: string }>>> {
  return queryCatalog(async () => {
    const db = getDb()!;
    return db.pickupCity.findMany({ orderBy: { name: "asc" } });
  });
}

export async function getPickupCities() {
  const result = await loadPickupCities();
  if (result.status === "setup") throw new CatalogSetupError();
  return result.data;
}
