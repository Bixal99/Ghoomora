import { VendorType } from "@prisma/client";
import { upsertGuide } from "@/app/actions/vendor";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPKR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function GuidePage() {
  const actor = await getActor(); const db = getDb();
  if (!db) return <PortalShell><AccessPanel /></PortalShell>;
  if (!actor) return <PortalShell><AccessPanel redirectTo="/guide-profile" /></PortalShell>;
  if (!actor.vendor) return <PortalShell><AccessPanel needsOnboarding /></PortalShell>;
  const enabled = actor.vendor.types.includes(VendorType.GUIDE);
  const guide = await db.guideProfile.findUnique({ where: { vendorId: actor.vendor.id } });
  return <PortalShell><p className="eyebrow text-[#5a7f73]">Local expertise</p><h1 className="display-title mt-2 text-6xl">Guide profile</h1>{enabled ? <Card className="mt-8 max-w-3xl p-7"><form action={upsertGuide} className="grid gap-5"><label className="text-sm font-bold">Languages, comma separated<input name="languages" defaultValue={guide?.languages.join(", ")} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Years of experience<input name="yearsExperience" type="number" min={0} defaultValue={guide?.yearsExperience ?? 0} className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label><label className="text-sm font-bold">Daily rate PKR<input name="dailyRate" type="number" min={1} defaultValue={guide?.dailyRate} required className="focus-ring mt-2 h-11 w-full rounded-xl border bg-white px-3" /></label></div><label className="text-sm font-bold"><input name="certified" type="checkbox" defaultChecked={guide?.certified} className="mr-2 accent-[#173f35]" />Certification reviewed</label><Button>Save guide profile</Button></form>{guide && <p className="mt-5 text-sm text-muted-foreground">Current rate: {formatPKR(guide.dailyRate)} per day.</p>}</Card> : <Card className="mt-8 p-7">Add GUIDE to your vendor profile before publishing guide details.</Card>}</PortalShell>;
}
