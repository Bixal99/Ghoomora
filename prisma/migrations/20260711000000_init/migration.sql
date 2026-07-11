-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('TRANSPORT', 'HOTEL', 'GUIDE', 'CAMP');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('WAGON', 'COASTER', 'CAR', 'LAND_CRUISER', 'PRADO', 'JEEP');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('SHARED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "HotelTier" AS ENUM ('BUDGET', 'MID', 'LUXURY');

-- CreateEnum
CREATE TYPE "TierLevel" AS ENUM ('STANDARD', 'MODERATE', 'LUXURY');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevationMeters" INTEGER NOT NULL,
    "bestSeasonStart" INTEGER NOT NULL,
    "bestSeasonEnd" INTEGER NOT NULL,
    "difficulty" TEXT,
    "description" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "requiresLocalTransport" BOOLEAN NOT NULL DEFAULT false,
    "localTransportNote" TEXT,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "types" "VendorType"[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "contactPhone" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupCity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "PickupCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "seats" INTEGER NOT NULL,
    "ac" BOOLEAN NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleFare" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "mode" "TransportMode" NOT NULL,
    "pickupCityId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "VehicleFare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalHireRate" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "pricePerDay" INTEGER NOT NULL,

    CONSTRAINT "LocalHireRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "HotelTier" NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideProfile" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "languages" TEXT[],
    "yearsExperience" INTEGER NOT NULL,
    "dailyRate" INTEGER NOT NULL,
    "certified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GuideProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampSite" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amenities" TEXT[],
    "capacityTents" INTEGER NOT NULL,
    "pricePerNight" INTEGER NOT NULL,

    CONSTRAINT "CampSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minDays" INTEGER NOT NULL,
    "maxDays" INTEGER NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageTier" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "tier" "TierLevel" NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "transportMode" "TransportMode" NOT NULL,
    "pricePerPersonPerDay" INTEGER NOT NULL,
    "hotelTier" "HotelTier" NOT NULL,
    "includesGuide" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackageTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageStop" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "stopType" TEXT NOT NULL,
    "hotelId" TEXT,

    CONSTRAINT "PackageStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "pickupCityId" TEXT NOT NULL,
    "selectedDays" INTEGER NOT NULL,
    "travelDate" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalPrice" INTEGER NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traveler" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "idNumber" TEXT,
    "phone" TEXT,

    CONSTRAINT "Traveler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyPoint" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,

    CONSTRAINT "SafetyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_name_idx" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Destination_regionId_name_idx" ON "Destination"("regionId", "name");

-- CreateIndex
CREATE INDEX "Destination_requiresLocalTransport_idx" ON "Destination"("requiresLocalTransport");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_ownerId_key" ON "Vendor"("ownerId");

-- CreateIndex
CREATE INDEX "Vendor_verified_idx" ON "Vendor"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "PickupCity_name_key" ON "PickupCity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PickupCity_slug_key" ON "PickupCity"("slug");

-- CreateIndex
CREATE INDEX "Vehicle_vendorId_type_idx" ON "Vehicle"("vendorId", "type");

-- CreateIndex
CREATE INDEX "VehicleFare_pickupCityId_regionId_mode_idx" ON "VehicleFare"("pickupCityId", "regionId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleFare_vehicleId_pickupCityId_regionId_mode_key" ON "VehicleFare"("vehicleId", "pickupCityId", "regionId", "mode");

-- CreateIndex
CREATE INDEX "LocalHireRate_destinationId_idx" ON "LocalHireRate"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "LocalHireRate_vehicleId_destinationId_key" ON "LocalHireRate"("vehicleId", "destinationId");

-- CreateIndex
CREATE INDEX "Hotel_vendorId_idx" ON "Hotel"("vendorId");

-- CreateIndex
CREATE INDEX "Hotel_destinationId_tier_idx" ON "Hotel"("destinationId", "tier");

-- CreateIndex
CREATE INDEX "Room_hotelId_available_idx" ON "Room"("hotelId", "available");

-- CreateIndex
CREATE UNIQUE INDEX "GuideProfile_vendorId_key" ON "GuideProfile"("vendorId");

-- CreateIndex
CREATE INDEX "CampSite_vendorId_idx" ON "CampSite"("vendorId");

-- CreateIndex
CREATE INDEX "Package_vendorId_idx" ON "Package"("vendorId");

-- CreateIndex
CREATE INDEX "Package_minDays_maxDays_idx" ON "Package"("minDays", "maxDays");

-- CreateIndex
CREATE INDEX "PackageTier_tier_pricePerPersonPerDay_idx" ON "PackageTier"("tier", "pricePerPersonPerDay");

-- CreateIndex
CREATE UNIQUE INDEX "PackageTier_packageId_tier_key" ON "PackageTier"("packageId", "tier");

-- CreateIndex
CREATE INDEX "PackageStop_packageId_dayNumber_idx" ON "PackageStop"("packageId", "dayNumber");

-- CreateIndex
CREATE INDEX "PackageStop_destinationId_idx" ON "PackageStop"("destinationId");

-- CreateIndex
CREATE INDEX "Booking_customerId_status_idx" ON "Booking"("customerId", "status");

-- CreateIndex
CREATE INDEX "Booking_packageId_travelDate_idx" ON "Booking"("packageId", "travelDate");

-- CreateIndex
CREATE INDEX "Traveler_bookingId_idx" ON "Traveler"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "SafetyPoint_destinationId_type_idx" ON "SafetyPoint"("destinationId", "type");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFare" ADD CONSTRAINT "VehicleFare_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFare" ADD CONSTRAINT "VehicleFare_pickupCityId_fkey" FOREIGN KEY ("pickupCityId") REFERENCES "PickupCity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleFare" ADD CONSTRAINT "VehicleFare_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalHireRate" ADD CONSTRAINT "LocalHireRate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalHireRate" ADD CONSTRAINT "LocalHireRate_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideProfile" ADD CONSTRAINT "GuideProfile_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampSite" ADD CONSTRAINT "CampSite_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTier" ADD CONSTRAINT "PackageTier_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageStop" ADD CONSTRAINT "PackageStop_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageStop" ADD CONSTRAINT "PackageStop_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "PackageTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupCityId_fkey" FOREIGN KEY ("pickupCityId") REFERENCES "PickupCity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traveler" ADD CONSTRAINT "Traveler_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyPoint" ADD CONSTRAINT "SafetyPoint_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
