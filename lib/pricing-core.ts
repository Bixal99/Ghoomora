import { z } from "zod";

export const estimateInputSchema = z.object({
  selectedDays: z.coerce.number().int().positive(),
  travelerCount: z.coerce.number().int().min(1).max(30),
  pickupFare: z.coerce.number().int().nonnegative(),
  localHireRates: z.array(z.coerce.number().int().nonnegative()).default([]),
});

export type PriceEstimate = {
  pickupFare: number;
  stayAndExtras: number;
  localTransport: number;
  total: number;
  localHireDetails?: { destinationName: string; pricePerDay: number }[];
  usingDemo?: boolean;
};

export type ResolvedPriceInput = {
  packageId: string;
  tierId: string;
  pickupCitySlug: string;
  selectedDays: number;
  travelerCount: number;
};

type TierLike = { pricePerPersonPerDay: number; tier: "STANDARD" | "MODERATE" | "LUXURY" };
type PackageLike = { minDays: number; maxDays: number };

export function calculateEstimate(pkg: PackageLike, tier: TierLike, input: z.input<typeof estimateInputSchema>): PriceEstimate {
  const parsed = estimateInputSchema.parse(input);
  if (parsed.selectedDays < pkg.minDays || parsed.selectedDays > pkg.maxDays) throw new Error("Selected days are outside this package range.");
  const localTransport = tier.tier === "LUXURY" ? 0 : parsed.localHireRates.reduce((total, rate) => total + rate, 0);
  const stayAndExtras = tier.pricePerPersonPerDay * parsed.selectedDays * parsed.travelerCount;
  return { pickupFare: parsed.pickupFare, stayAndExtras, localTransport, total: parsed.pickupFare + stayAndExtras + localTransport };
}

export function demoPickupFare(tier: { transportMode: string; vehicleType: string }, pickupCity: string) {
  const premium = pickupCity === "islamabad" || pickupCity === "rawalpindi" ? 0 : 18000;
  if (tier.transportMode === "SHARED") return 12500 + premium;
  if (tier.vehicleType === "CAR") return 72000 + premium;
  return 145000 + premium * 2;
}
