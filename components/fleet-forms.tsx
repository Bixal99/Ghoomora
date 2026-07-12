"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { createFare, createLocalHireRate, createVehicle } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormSelect } from "@/components/ui/select";

const vehicleTypes = ["COASTER", "CAR", "WAGON", "LAND_CRUISER", "PRADO", "JEEP"] as const;

type VehicleOption = { id: string; type: string; seats: number };
type NamedOption = { id: string; name: string };

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}

export function FleetForms({
  pickupVehicles,
  localHireVehicles,
  cities,
  regions,
  destinations,
}: {
  vehicles: VehicleOption[];
  pickupVehicles: VehicleOption[];
  localHireVehicles: VehicleOption[];
  cities: NamedOption[];
  regions: NamedOption[];
  destinations: NamedOption[];
}) {
  const [vehicleType, setVehicleType] = useState<string>(vehicleTypes[0]);
  const [pickupVehicleId, setPickupVehicleId] = useState(pickupVehicles[0]?.id ?? "");
  const [pickupCityId, setPickupCityId] = useState(cities[0]?.id ?? "");
  const [regionId, setRegionId] = useState(regions[0]?.id ?? "");
  const [mode, setMode] = useState("SHARED");
  const [localVehicleId, setLocalVehicleId] = useState(localHireVehicles[0]?.id ?? "");
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? "");

  async function onCreateVehicle(formData: FormData) {
    try {
      await createVehicle(formData);
      notify.success("Vehicle added", "Your fleet inventory was updated.");
    } catch (reason) {
      notify.error("Could not add vehicle", errorMessage(reason));
    }
  }

  async function onCreateFare(formData: FormData) {
    try {
      await createFare(formData);
      notify.success("Pickup fare saved");
    } catch (reason) {
      notify.error("Could not save fare", errorMessage(reason));
    }
  }

  async function onCreateLocalHire(formData: FormData) {
    try {
      await createLocalHireRate(formData);
      notify.success("Local hire rate saved");
    } catch (reason) {
      notify.error("Could not save rate", errorMessage(reason));
    }
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-3">
      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Add vehicle</h2>
        <form action={onCreateVehicle} className="mt-5 grid gap-4">
          <Field label="Type">
            <FormSelect
              name="type"
              value={vehicleType}
              onValueChange={setVehicleType}
              placeholder="Choose vehicle type"
              options={vehicleTypes.map((type) => ({ value: type, label: type }))}
            />
          </Field>
          <Field label="Seats">
            <input name="seats" type="number" min={1} max={60} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm font-normal" />
          </Field>
          <label className="flex items-center text-sm font-bold">
            <input name="ac" type="checkbox" className="mr-2 accent-[#173f35]" />
            Air-conditioned
          </label>
          <Button type="submit">Add vehicle</Button>
        </form>
      </Card>

      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Set pickup fare</h2>
        <form action={onCreateFare} className="mt-5 grid gap-4">
          <Field
            label="Vehicle"
            hint={!pickupVehicles.length ? "Pickup fares need a COASTER (shared) or CAR (private) in your fleet." : undefined}
          >
            <FormSelect
              name="vehicleId"
              value={pickupVehicleId}
              onValueChange={setPickupVehicleId}
              placeholder="Add a COASTER or CAR first"
              disabled={!pickupVehicles.length}
              options={pickupVehicles.map((item) => ({ value: item.id, label: `${item.type} · ${item.seats} seats` }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pickup city">
              <FormSelect
                name="pickupCityId"
                value={pickupCityId}
                onValueChange={setPickupCityId}
                placeholder="Choose city"
                options={cities.map((item) => ({ value: item.id, label: item.name }))}
              />
            </Field>
            <Field label="Region">
              <FormSelect
                name="regionId"
                value={regionId}
                onValueChange={setRegionId}
                placeholder="Choose region"
                options={regions.map((item) => ({ value: item.id, label: item.name }))}
              />
            </Field>
          </div>
          <Field label="Mode">
            <FormSelect
              name="mode"
              value={mode}
              onValueChange={setMode}
              placeholder="Choose mode"
              options={[{ value: "SHARED", label: "SHARED" }, { value: "PRIVATE", label: "PRIVATE" }]}
            />
          </Field>
          <Field label="Fare in PKR">
            <input name="price" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm font-normal" />
          </Field>
          <Button type="submit" disabled={!pickupVehicles.length || !pickupVehicleId}>Save fare</Button>
        </form>
      </Card>

      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Set local day-hire</h2>
        <form action={onCreateLocalHire} className="mt-5 grid gap-4">
          <Field
            label="4x4 vehicle"
            hint={!localHireVehicles.length ? "Add a JEEP, WAGON, PRADO, or LAND_CRUISER in the first column — COASTER/CAR cannot be used here." : undefined}
          >
            <FormSelect
              name="vehicleId"
              value={localVehicleId}
              onValueChange={setLocalVehicleId}
              placeholder="No 4x4 vehicles yet"
              disabled={!localHireVehicles.length}
              options={localHireVehicles.map((item) => ({ value: item.id, label: `${item.type} · ${item.seats} seats` }))}
            />
          </Field>
          <Field label="Destination">
            <FormSelect
              name="destinationId"
              value={destinationId}
              onValueChange={setDestinationId}
              placeholder="Choose destination"
              options={destinations.map((item) => ({ value: item.id, label: item.name }))}
            />
          </Field>
          <Field label="Price per day (PKR)">
            <input name="pricePerDay" type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm font-normal" />
          </Field>
          <Button type="submit" disabled={!localHireVehicles.length || !localVehicleId}>Save local hire rate</Button>
        </form>
      </Card>
    </div>
  );
}
