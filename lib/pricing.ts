import "server-only";
import type { PackageView, TierView } from "@/lib/data";
import { getDb } from "@/lib/db";
import { calculateEstimate, demoPickupFare, type PriceEstimate, type ResolvedPriceInput } from "@/lib/pricing-core";

export { calculateEstimate, demoPickupFare, estimateInputSchema } from "@/lib/pricing-core";
export type { PriceEstimate, ResolvedPriceInput } from "@/lib/pricing-core";

export function buildDemoEstimate(pkg: PackageView, tier: TierView, pickupCitySlug: string, selectedDays: number, travelerCount: number): PriceEstimate {
  const roughStops = pkg.stops.filter((stop) => stop.destination.requiresLocalTransport);
  const pickupBase = demoPickupFare(tier, pickupCitySlug);
  const pickupFare = tier.transportMode === "SHARED" ? pickupBase * travelerCount : pickupBase;
  return calculateEstimate(pkg, tier, { selectedDays, travelerCount, pickupFare, localHireRates: roughStops.map(() => 18000) });
}

export async function resolveBookingPrice(input: ResolvedPriceInput): Promise<PriceEstimate & { canCheckout: boolean; missingLocalHire: string[] }> {
  const db = getDb();
  const pkg = await db?.package.findUnique({
    where: { id: input.packageId },
    include: { tiers: true, stops: { include: { destination: { include: { region: true } } }, orderBy: { dayNumber: "asc" } } },
  });

  if (!db || !pkg) {
    const estimate = calculateEstimate({ minDays: 4, maxDays: 8 }, { tier: "STANDARD", pricePerPersonPerDay: 9500 }, {
      selectedDays: input.selectedDays,
      travelerCount: input.travelerCount,
      pickupFare: demoPickupFare({ transportMode: "SHARED", vehicleType: "COASTER" }, input.pickupCitySlug) * input.travelerCount,
      localHireRates: [],
    });
    return { ...estimate, canCheckout: false, missingLocalHire: [], usingDemo: true };
  }

  const tier = pkg.tiers.find((item) => item.id === input.tierId);
  if (!tier) throw new Error("Tier not found.");
  if (input.selectedDays < pkg.minDays || input.selectedDays > pkg.maxDays) throw new Error("Selected days are outside this package range.");

  const pickupCity = await db.pickupCity.findFirst({ where: { slug: input.pickupCitySlug } });
  if (!pickupCity) throw new Error("Pickup city not found.");

  const primaryRegionId = pkg.stops[0]?.destination.regionId;
  if (!primaryRegionId) throw new Error("Package has no stops.");

  const fare = await db.vehicleFare.findFirst({
    where: { mode: tier.transportMode, pickupCityId: pickupCity.id, regionId: primaryRegionId, vehicle: { type: tier.vehicleType, vendor: { verified: true } } },
    orderBy: { price: "asc" },
  });

  const pickupBase = fare?.price ?? demoPickupFare(tier, input.pickupCitySlug);
  const pickupFare = tier.transportMode === "SHARED" ? pickupBase * input.travelerCount : pickupBase;

  const roughDestinations = Array.from(new Map(pkg.stops.filter((stop) => stop.destination.requiresLocalTransport).map((stop) => [stop.destination.id, stop.destination])).values());
  const localHireDetails: { destinationName: string; pricePerDay: number }[] = [];
  const missingLocalHire: string[] = [];

  for (const destination of roughDestinations) {
    const rate = await db.localHireRate.findFirst({ where: { destinationId: destination.id, vehicle: { vendor: { verified: true } } }, orderBy: { pricePerDay: "asc" } });
    if (rate) localHireDetails.push({ destinationName: destination.name, pricePerDay: rate.pricePerDay });
    else missingLocalHire.push(destination.name);
  }

  const estimate = calculateEstimate(pkg, tier, { selectedDays: input.selectedDays, travelerCount: input.travelerCount, pickupFare, localHireRates: localHireDetails.map((item) => item.pricePerDay) });
  return { ...estimate, localHireDetails, canCheckout: tier.tier === "LUXURY" || missingLocalHire.length === 0, missingLocalHire, usingDemo: !fare };
}
