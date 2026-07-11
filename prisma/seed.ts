import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, HotelTier, TierLevel, TransportMode, VehicleType, VendorType, Role } from "@prisma/client";
import { Pool } from "pg";
import { destinationSeed, pickupCitySeed, regionSeed } from "./seed-data";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed Ghoomora.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const regions = new Map<string, string>();
  for (const region of regionSeed) {
    const saved = await prisma.region.upsert({ where: { slug: region.slug }, update: { name: region.name }, create: { name: region.name, slug: region.slug } });
    regions.set(region.slug, saved.id);
  }
  for (const destination of destinationSeed) {
    const regionId = regions.get(destination.regionSlug);
    if (!regionId) continue;
    const { regionSlug, ...data } = destination;
    void regionSlug;
    await prisma.destination.upsert({ where: { slug: destination.slug }, update: { ...data, regionId }, create: { ...data, regionId } });
  }
  for (const city of pickupCitySeed) await prisma.pickupCity.upsert({ where: { slug: city.slug }, update: city, create: city });

  const owner = await prisma.user.upsert({ where: { clerkId: "seed-vendor-owner" }, update: {}, create: { clerkId: "seed-vendor-owner", email: "sample.vendor@ghoomora.pk", name: "Ghoomora Sample Vendor", role: Role.VENDOR } });
  const vendor = await prisma.vendor.upsert({ where: { ownerId: owner.id }, update: { verified: true }, create: { ownerId: owner.id, businessName: "Northbound Expeditions — Sample", types: [VendorType.TRANSPORT, VendorType.HOTEL, VendorType.GUIDE], verified: true, contactPhone: "+92 300 0000000", description: "Representative development data, not a live vendor." } });
  const coaster = await prisma.vehicle.findFirst({ where: { vendorId: vendor.id, type: VehicleType.COASTER } }) ?? await prisma.vehicle.create({ data: { vendorId: vendor.id, type: VehicleType.COASTER, seats: 22, ac: true } });
  const car = await prisma.vehicle.findFirst({ where: { vendorId: vendor.id, type: VehicleType.CAR } }) ?? await prisma.vehicle.create({ data: { vendorId: vendor.id, type: VehicleType.CAR, seats: 4, ac: true } });
  const jeep = await prisma.vehicle.findFirst({ where: { vendorId: vendor.id, type: VehicleType.JEEP } }) ?? await prisma.vehicle.create({ data: { vendorId: vendor.id, type: VehicleType.JEEP, seats: 6, ac: false } });
  for (const city of await prisma.pickupCity.findMany()) {
    for (const region of await prisma.region.findMany()) {
      const distancePremium = city.slug === "islamabad" || city.slug === "rawalpindi" ? 0 : 18000;
      for (const fare of [
        { vehicleId: coaster.id, mode: TransportMode.SHARED, price: 12500 + distancePremium },
        { vehicleId: coaster.id, mode: TransportMode.PRIVATE, price: 145000 + distancePremium * 2 },
        { vehicleId: car.id, mode: TransportMode.PRIVATE, price: 72000 + distancePremium },
      ]) await prisma.vehicleFare.upsert({ where: { vehicleId_pickupCityId_regionId_mode: { vehicleId: fare.vehicleId, pickupCityId: city.id, regionId: region.id, mode: fare.mode } }, update: { price: fare.price }, create: { ...fare, pickupCityId: city.id, regionId: region.id } });
    }
  }
  for (const destination of await prisma.destination.findMany({ where: { requiresLocalTransport: true } })) await prisma.localHireRate.upsert({ where: { vehicleId_destinationId: { vehicleId: jeep.id, destinationId: destination.id } }, update: { pricePerDay: 18000 }, create: { vehicleId: jeep.id, destinationId: destination.id, pricePerDay: 18000 } });

  const hunza = await prisma.destination.findUniqueOrThrow({ where: { slug: "hunza-valley" } });
  const attabad = await prisma.destination.findUniqueOrThrow({ where: { slug: "attabad-lake" } });
  let pkg = await prisma.package.findFirst({ where: { vendorId: vendor.id, title: "Hunza Highlands — Sample" } });
  if (!pkg) pkg = await prisma.package.create({ data: { vendorId: vendor.id, title: "Hunza Highlands — Sample", description: "A representative journey through central and upper Hunza. This is sample data until real vendors are onboarded.", minDays: 5, maxDays: 8 } });
  await prisma.packageStop.deleteMany({ where: { packageId: pkg.id } });
  await prisma.packageStop.createMany({ data: [{ packageId: pkg.id, destinationId: hunza.id, dayNumber: 1, stopType: "overnight" }, { packageId: pkg.id, destinationId: attabad.id, dayNumber: 3, stopType: "viewpoint" }] });
  const tiers = [
    { tier: TierLevel.STANDARD, vehicleType: VehicleType.COASTER, transportMode: TransportMode.SHARED, pricePerPersonPerDay: 9500, hotelTier: HotelTier.BUDGET, includesGuide: false },
    { tier: TierLevel.MODERATE, vehicleType: VehicleType.CAR, transportMode: TransportMode.PRIVATE, pricePerPersonPerDay: 16500, hotelTier: HotelTier.MID, includesGuide: false },
    { tier: TierLevel.LUXURY, vehicleType: VehicleType.COASTER, transportMode: TransportMode.PRIVATE, pricePerPersonPerDay: 28500, hotelTier: HotelTier.LUXURY, includesGuide: true },
  ];
  for (const tier of tiers) await prisma.packageTier.upsert({ where: { packageId_tier: { packageId: pkg.id, tier: tier.tier } }, update: tier, create: { packageId: pkg.id, ...tier } });
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
