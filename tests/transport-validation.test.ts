import { describe, expect, it } from "vitest";
import { validLocalHireVehicle, validPickupCombination } from "../lib/validation";

describe("transport model", () => {
  it.each([["COASTER", "SHARED"], ["COASTER", "PRIVATE"], ["CAR", "PRIVATE"]])("allows %s + %s for pickup legs", (vehicle, mode) => expect(validPickupCombination(vehicle, mode)).toBe(true));
  it.each([["CAR", "SHARED"], ["JEEP", "PRIVATE"], ["WAGON", "SHARED"]])("rejects %s + %s for pickup legs", (vehicle, mode) => expect(validPickupCombination(vehicle, mode)).toBe(false));
  it.each(["WAGON", "LAND_CRUISER", "PRADO", "JEEP"])("allows %s for local day-hire", (vehicle) => expect(validLocalHireVehicle(vehicle)).toBe(true));
  it.each(["COASTER", "CAR"])("rejects %s for local day-hire", (vehicle) => expect(validLocalHireVehicle(vehicle)).toBe(false));
});
