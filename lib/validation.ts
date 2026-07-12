import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.coerce.boolean().default(false),
});

export const vendorApplicationSchema = z.object({
  businessName: z.string().trim().min(3, "Business name is too short.").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  cnic: z.string().trim().regex(/^\d{5}-?\d{7}-?\d$/, "Enter a valid CNIC (13 digits)."),
  description: z.string().trim().min(20, "Tell us more about your business.").max(700),
  requestedTypes: z.array(z.enum(["TRANSPORT", "HOTEL", "GUIDE", "CAMP"])).min(1, "Select at least one service."),
  documentUrl: z.string().url().optional(),
});

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
