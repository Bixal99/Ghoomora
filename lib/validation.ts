import { z } from "zod";

export const vendorSchema = z.object({
  businessName: z.string().trim().min(3).max(100),
  contactPhone: z.string().trim().min(7).max(30),
  description: z.string().trim().max(700).optional(),
  types: z.array(z.enum(["TRANSPORT", "HOTEL", "GUIDE", "CAMP"])).min(1),
});

export const vehicleSchema = z.object({
  type: z.enum(["WAGON", "COASTER", "CAR", "LAND_CRUISER", "PRADO", "JEEP"]),
  seats: z.coerce.number().int().min(1).max(60),
  ac: z.coerce.boolean().default(false),
});

export const fareSchema = z.object({
  vehicleId: z.string().min(1), pickupCityId: z.string().min(1), regionId: z.string().min(1),
  mode: z.enum(["SHARED", "PRIVATE"]), price: z.coerce.number().int().positive(),
});

export const localHireSchema = z.object({
  vehicleId: z.string().min(1),
  destinationId: z.string().min(1),
  pricePerDay: z.coerce.number().int().positive(),
});

export const packageStopSchema = z.object({
  destinationId: z.string().min(1),
  dayNumber: z.coerce.number().int().positive(),
  stopType: z.enum(["overnight", "meal", "fuel", "prayer", "viewpoint"]),
});

export function validPickupCombination(type: string, mode: string) {
  return (type === "COASTER" && (mode === "SHARED" || mode === "PRIVATE")) || (type === "CAR" && mode === "PRIVATE");
}

export function validLocalHireVehicle(type: string) {
  return ["WAGON", "LAND_CRUISER", "PRADO", "JEEP"].includes(type);
}
