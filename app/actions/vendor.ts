"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HotelTier, Role, TierLevel, TransportMode, VehicleType, VendorType } from "@prisma/client";
import { getDb } from "@/lib/db";
import { requireActor } from "@/lib/auth";
import { fareSchema, validPickupCombination, vehicleSchema, vendorSchema } from "@/lib/validation";

function values(formData: FormData, key: string) { return formData.getAll(key).map(String); }

export async function onboardVendor(formData: FormData) {
  const db = getDb();
  const actor = await requireActor([Role.CUSTOMER, Role.VENDOR]);
  if (!db) throw new Error("Database is not configured.");
  const parsed = vendorSchema.parse({ businessName: formData.get("businessName"), contactPhone: formData.get("contactPhone"), description: formData.get("description") || undefined, types: values(formData, "types") });
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: actor.id }, data: { role: Role.VENDOR } });
    await tx.vendor.upsert({ where: { ownerId: actor.id }, update: { ...parsed, types: parsed.types as VendorType[], verified: false }, create: { ownerId: actor.id, ...parsed, types: parsed.types as VendorType[] } });
  });
  revalidatePath("/dashboard");
  redirect("/dashboard?notice=Profile+submitted+for+approval");
}

export async function createVehicle(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor) throw new Error("Vendor profile is required.");
  const data = vehicleSchema.parse({ type: formData.get("type"), seats: formData.get("seats"), ac: formData.get("ac") === "on" });
  await db.vehicle.create({ data: { vendorId: actor.vendor.id, type: data.type as VehicleType, seats: data.seats, ac: data.ac } });
  revalidatePath("/fleet");
}

export async function createFare(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor) throw new Error("Vendor profile is required.");
  const data = fareSchema.parse(Object.fromEntries(formData));
  const vehicle = await db.vehicle.findFirst({ where: { id: data.vehicleId, vendorId: actor.vendor.id } });
  if (!vehicle || !validPickupCombination(vehicle.type, data.mode)) throw new Error("Unsupported pickup transport combination.");
  await db.vehicleFare.upsert({ where: { vehicleId_pickupCityId_regionId_mode: { vehicleId: vehicle.id, pickupCityId: data.pickupCityId, regionId: data.regionId, mode: data.mode as TransportMode } }, update: { price: data.price }, create: { vehicleId: vehicle.id, pickupCityId: data.pickupCityId, regionId: data.regionId, mode: data.mode as TransportMode, price: data.price } });
  revalidatePath("/fleet");
}

export async function createHotel(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor || !actor.vendor.types.includes(VendorType.HOTEL)) throw new Error("Hotel vendor profile is required.");
  const name = String(formData.get("name") ?? "").trim();
  const destinationId = String(formData.get("destinationId") ?? "");
  const tier = String(formData.get("tier") ?? "") as HotelTier;
  if (name.length < 3 || !Object.values(HotelTier).includes(tier)) throw new Error("Invalid hotel details.");
  await db.hotel.create({ data: { vendorId: actor.vendor.id, name, destinationId, tier, rooms: { create: { type: String(formData.get("roomType") ?? "Standard"), capacity: Number(formData.get("capacity") ?? 2), pricePerNight: Number(formData.get("pricePerNight") ?? 0) } } } });
  revalidatePath("/hotels");
}

export async function upsertGuide(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor || !actor.vendor.types.includes(VendorType.GUIDE)) throw new Error("Guide vendor profile is required.");
  const data = { languages: String(formData.get("languages") ?? "").split(",").map((item) => item.trim()).filter(Boolean), yearsExperience: Number(formData.get("yearsExperience")), dailyRate: Number(formData.get("dailyRate")), certified: formData.get("certified") === "on" };
  if (!data.languages.length || data.yearsExperience < 0 || data.dailyRate <= 0) throw new Error("Invalid guide profile.");
  await db.guideProfile.upsert({ where: { vendorId: actor.vendor.id }, update: data, create: { vendorId: actor.vendor.id, ...data } });
  revalidatePath("/guide-profile");
}

export async function createCamp(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor || !actor.vendor.types.includes(VendorType.CAMP)) throw new Error("Camp vendor profile is required.");
  const data = { name: String(formData.get("name") ?? "").trim(), amenities: String(formData.get("amenities") ?? "").split(",").map((item) => item.trim()).filter(Boolean), capacityTents: Number(formData.get("capacityTents")), pricePerNight: Number(formData.get("pricePerNight")) };
  if (data.name.length < 3 || data.capacityTents < 1 || data.pricePerNight <= 0) throw new Error("Invalid camp details.");
  await db.campSite.create({ data: { vendorId: actor.vendor.id, ...data } });
  revalidatePath("/camps");
}

export async function createPackage(formData: FormData) {
  const db = getDb(); const actor = await requireActor([Role.VENDOR]);
  if (!db || !actor.vendor) throw new Error("Vendor profile is required.");
  const minDays = Number(formData.get("minDays")); const maxDays = Number(formData.get("maxDays"));
  if (minDays < 2 || maxDays < minDays) throw new Error("Invalid day range.");
  const title = String(formData.get("title") ?? "").trim(); const description = String(formData.get("description") ?? "").trim(); const destinationId = String(formData.get("destinationId") ?? "");
  if (title.length < 4 || description.length < 20 || !destinationId) throw new Error("Complete package details are required.");
  const rates = { STANDARD: Number(formData.get("standardRate")), MODERATE: Number(formData.get("moderateRate")), LUXURY: Number(formData.get("luxuryRate")) };
  if (Object.values(rates).some((rate) => rate <= 0)) throw new Error("All three tier rates are required.");
  await db.package.create({ data: { vendorId: actor.vendor.id, title, description, minDays, maxDays, stops: { create: { destinationId, dayNumber: 1, stopType: "overnight" } }, tiers: { create: [
    { tier: TierLevel.STANDARD, vehicleType: VehicleType.COASTER, transportMode: TransportMode.SHARED, pricePerPersonPerDay: rates.STANDARD, hotelTier: HotelTier.BUDGET },
    { tier: TierLevel.MODERATE, vehicleType: VehicleType.CAR, transportMode: TransportMode.PRIVATE, pricePerPersonPerDay: rates.MODERATE, hotelTier: HotelTier.MID },
    { tier: TierLevel.LUXURY, vehicleType: VehicleType.COASTER, transportMode: TransportMode.PRIVATE, pricePerPersonPerDay: rates.LUXURY, hotelTier: HotelTier.LUXURY, includesGuide: true },
  ] } } });
  revalidatePath("/vendor/packages"); revalidatePath("/packages");
}
