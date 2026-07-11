"use server";

import { resolveBookingPrice, type ResolvedPriceInput } from "@/lib/pricing";

export async function getPriceEstimate(input: ResolvedPriceInput) {
  return resolveBookingPrice(input);
}
