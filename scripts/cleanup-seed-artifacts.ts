import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";
import { resolvePgConnectionString } from "../lib/pg-connection";
import { SAMPLE_VENDOR_EMAIL } from "../prisma/seed-artifacts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to clean seed artifacts.");

const pool = new Pool({ connectionString: resolvePgConnectionString(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = SAMPLE_VENDOR_EMAIL.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { vendor: { include: { packages: true, vehicles: true, hotels: true } } },
  });

  const before = {
    users: user ? 1 : 0,
    vendors: user?.vendor ? 1 : 0,
    packages: user?.vendor?.packages.length ?? 0,
    vehicles: user?.vendor?.vehicles.length ?? 0,
    hotels: user?.vendor?.hotels.length ?? 0,
  };
  console.log("Before:", before);

  if (!user) {
    console.log(`No user with email ${SAMPLE_VENDOR_EMAIL} — nothing to delete.`);
  } else if (user.vendor) {
    const vendorId = user.vendor.id;
    const packageIds = user.vendor.packages.map((pkg) => pkg.id);
    const vehicleIds = user.vendor.vehicles.map((vehicle) => vehicle.id);
    const hotelIds = user.vendor.hotels.map((hotel) => hotel.id);

    if (packageIds.length) {
      const bookings = await prisma.booking.findMany({ where: { packageId: { in: packageIds } }, select: { id: true } });
      const bookingIds = bookings.map((booking) => booking.id);
      if (bookingIds.length) {
        await prisma.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await prisma.traveler.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      await prisma.packageStop.deleteMany({ where: { packageId: { in: packageIds } } });
      await prisma.packageTier.deleteMany({ where: { packageId: { in: packageIds } } });
      await prisma.package.deleteMany({ where: { id: { in: packageIds } } });
    }

    if (vehicleIds.length) {
      await prisma.localHireRate.deleteMany({ where: { vehicleId: { in: vehicleIds } } });
      await prisma.vehicleFare.deleteMany({ where: { vehicleId: { in: vehicleIds } } });
      await prisma.vehicle.deleteMany({ where: { id: { in: vehicleIds } } });
    }

    if (hotelIds.length) {
      await prisma.room.deleteMany({ where: { hotelId: { in: hotelIds } } });
      await prisma.hotel.deleteMany({ where: { id: { in: hotelIds } } });
    }

    await prisma.guideProfile.deleteMany({ where: { vendorId } });
    await prisma.campSite.deleteMany({ where: { vendorId } });
    await prisma.vendor.delete({ where: { id: vendorId } });
  }

  if (user) {
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.vendorApplication.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  const remaining = await prisma.user.findUnique({ where: { email } });
  const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  console.log("After:", {
    sampleVendorUsers: remaining ? 1 : 0,
    adminUsers: adminCount,
  });
  console.log("Cleanup complete. Regions, destinations, pickup cities, and admin users were left untouched.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
