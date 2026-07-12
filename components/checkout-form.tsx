"use client";

import { useState } from "react";
import { notify } from "@/lib/notify";
import { createBooking } from "@/app/actions/booking";
import type { PackageView } from "@/lib/data";
import type { PriceEstimate } from "@/lib/pricing-core";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CheckoutForm({
  pkg,
  tierId,
  pickupCitySlug,
  selectedDays,
  travelerCount,
  estimate,
}: {
  pkg: PackageView;
  tierId: string;
  pickupCitySlug: string;
  selectedDays: number;
  travelerCount: number;
  estimate: PriceEstimate;
}) {
  const [travelers, setTravelers] = useState(Array.from({ length: travelerCount }, (_, index) => ({ name: "Traveler " + (index + 1), idNumber: "", phone: "" })));
  const [travelDate, setTravelDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("packageId", pkg.id);
      formData.set("tierId", tierId);
      formData.set("pickupCitySlug", pickupCitySlug);
      formData.set("selectedDays", String(selectedDays));
      formData.set("travelerCount", String(travelerCount));
      formData.set("travelDate", travelDate);
      formData.set("travelersJson", JSON.stringify(travelers));
      await createBooking(formData);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Checkout failed.";
      setError(message);
      notify.error("Checkout failed", message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_.85fr]">
      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Traveler details</h2>
        <label className="mt-5 block text-sm font-bold">Departure date<input required type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
        <div className="mt-6 space-y-4">
          {travelers.map((traveler, index) => (
            <div key={index} className="rounded-xl bg-muted p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Traveler {index + 1}</p>
              <label className="mt-2 block text-sm font-bold">Full name<input required value={traveler.name} onChange={(event) => setTravelers((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
              <label className="mt-3 block text-sm font-bold">CNIC / passport<input value={traveler.idNumber} onChange={(event) => setTravelers((current) => current.map((item, i) => i === index ? { ...item, idNumber: event.target.value } : item))} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
            </div>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-[#b42318]">{error}</p>}
        <Button className="mt-6" size="lg" disabled={submitting}>{submitting ? "Creating booking…" : "Confirm booking"}</Button>
      </Card>
      <Card className="p-7">
        <h2 className="text-xl font-extrabold">Price summary</h2>
        <p className="mt-2 text-sm text-muted-foreground">{pkg.title} · {selectedDays} days · {travelerCount} travelers</p>
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><span>Pickup transport</span><strong>{formatPKR(estimate.pickupFare)}</strong></div>
          <div className="flex justify-between"><span>Stay & tier inclusions</span><strong>{formatPKR(estimate.stayAndExtras)}</strong></div>
          {estimate.localTransport > 0 && <div className="flex justify-between"><span>Local 4x4 day-hire</span><strong>{formatPKR(estimate.localTransport)}</strong></div>}
          <div className="border-t pt-3 flex justify-between text-base"><span>Total</span><strong>{formatPKR(estimate.total)}</strong></div>
        </div>
      </Card>
    </form>
  );
}
