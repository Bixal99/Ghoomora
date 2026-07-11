"use client";

import { useState } from "react";
import { updatePackageStops } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type StopDraft = { destinationId: string; dayNumber: number; stopType: string };

export function PackageStopEditor({
  packageId,
  stops,
  destinations,
}: {
  packageId: string;
  stops: StopDraft[];
  destinations: { id: string; name: string }[];
}) {
  const [draft, setDraft] = useState<StopDraft[]>(stops);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addStop() {
    setDraft((current) => [...current, { destinationId: destinations[0]?.id ?? "", dayNumber: current.length + 1, stopType: "viewpoint" }]);
  }

  function removeStop(index: number) {
    setDraft((current) => current.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("packageId", packageId);
      formData.set("stopsJson", JSON.stringify(draft));
      await updatePackageStops(formData);
      setMessage("Stops saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save stops.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-4 p-5">
      <h3 className="text-sm font-extrabold">Edit itinerary stops</h3>
      <div className="mt-4 space-y-3">
        {draft.map((stop, index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-muted p-3 md:grid-cols-4">
            <label className="text-xs font-bold">Day<input type="number" min={1} value={stop.dayNumber} onChange={(event) => setDraft((current) => current.map((item, i) => i === index ? { ...item, dayNumber: Number(event.target.value) } : item))} className="focus-ring mt-1 h-9 w-full rounded-lg border bg-white px-2" /></label>
            <label className="text-xs font-bold md:col-span-2">Destination<select value={stop.destinationId} onChange={(event) => setDraft((current) => current.map((item, i) => i === index ? { ...item, destinationId: event.target.value } : item))} className="focus-ring mt-1 h-9 w-full rounded-lg border bg-white px-2">{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-xs font-bold">Type<select value={stop.stopType} onChange={(event) => setDraft((current) => current.map((item, i) => i === index ? { ...item, stopType: event.target.value } : item))} className="focus-ring mt-1 h-9 w-full rounded-lg border bg-white px-2">{["overnight", "meal", "fuel", "prayer", "viewpoint"].map((type) => <option key={type}>{type}</option>)}</select></label>
            <Button type="button" variant="outline" size="sm" onClick={() => removeStop(index)}>Remove</Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addStop}>Add stop</Button>
        <Button type="button" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save stops"}</Button>
      </div>
      {message && <p className="mt-3 text-xs text-muted-foreground">{message}</p>}
    </Card>
  );
}
