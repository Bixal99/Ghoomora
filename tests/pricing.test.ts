import { describe, expect, it } from "vitest";
import { calculateEstimate } from "../lib/pricing-core";

const pkg = { minDays: 4, maxDays: 7 };
const standard = { tier: "STANDARD" as const, pricePerPersonPerDay: 10000 };
const luxury = { tier: "LUXURY" as const, pricePerPersonPerDay: 30000 };

describe("calculateEstimate", () => {
  it("itemizes pickup, stay, and local day-hire", () => {
    expect(calculateEstimate(pkg, standard, { selectedDays: 5, travelerCount: 2, pickupFare: 12000, localHireRates: [18000] })).toEqual({ pickupFare: 12000, stayAndExtras: 100000, localTransport: 18000, total: 130000 });
  });
  it("keeps bundled luxury local hire at zero", () => {
    expect(calculateEstimate(pkg, luxury, { selectedDays: 4, travelerCount: 2, pickupFare: 70000, localHireRates: [18000] }).localTransport).toBe(0);
  });
  it("rejects days outside the package range", () => {
    expect(() => calculateEstimate(pkg, standard, { selectedDays: 8, travelerCount: 2, pickupFare: 12000, localHireRates: [] })).toThrow(/outside/);
  });
  it("rejects invalid traveler counts", () => {
    expect(() => calculateEstimate(pkg, standard, { selectedDays: 5, travelerCount: 0, pickupFare: 12000, localHireRates: [] })).toThrow();
  });
});
