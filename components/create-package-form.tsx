"use client";

import { toast } from "sonner";
import { createPackage } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";

export function CreatePackageForm({
  destinations,
}: {
  destinations: Array<{ id: string; name: string; regionName: string }>;
}) {
  async function action(formData: FormData) {
    try {
      await createPackage(formData);
      toast.success("Package created");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not create package.");
    }
  }

  return (
    <form action={action} className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="text-sm font-bold">Title<input name="title" required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
      <label className="text-sm font-bold">First destination<select name="destinationId" className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3">{destinations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.regionName}</option>)}</select></label>
      <label className="text-sm font-bold md:col-span-2">Description<textarea name="description" minLength={20} required rows={3} className="focus-ring mt-2 w-full rounded-xl border bg-white px-3" /></label>
      <label className="text-sm font-bold">Minimum days<input name="minDays" type="number" min={2} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
      <label className="text-sm font-bold">Maximum days<input name="maxDays" type="number" min={2} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
      {([["standardRate", "Standard daily rate"], ["moderateRate", "Moderate daily rate"], ["luxuryRate", "Luxury daily rate"]] as const).map(([name, label]) => (
        <label key={name} className="text-sm font-bold">{label}<input name={name} type="number" min={1} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label>
      ))}
      <Button className="md:col-span-2">Create package</Button>
    </form>
  );
}
