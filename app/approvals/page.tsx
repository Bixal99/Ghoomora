import { Role } from "@prisma/client";
import { setVendorApproval } from "@/app/actions/admin";
import { AccessPanel } from "@/components/access-panel";
import { PortalShell } from "@/components/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const actor = await getActor();
  if (!actor || actor.role !== Role.ADMIN) return <PortalShell admin><AccessPanel /></PortalShell>;
  const db = getDb();
  const vendors = db ? await db.vendor.findMany({ include: { owner: true, _count: { select: { vehicles: true, hotels: true, packages: true } } }, orderBy: [{ verified: "asc" }, { businessName: "asc" }] }) : [];
  return <PortalShell admin><p className="eyebrow text-[#5a7f73]">Admin control</p><h1 className="display-title mt-2 text-6xl">Vendor approvals</h1><p className="mt-4 text-muted-foreground">Verification controls public package visibility.</p><div className="mt-8 grid gap-4">{vendors.map((vendor) => <Card key={vendor.id} className="p-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex gap-2"><Badge>{vendor.verified ? "Verified" : "Pending"}</Badge>{vendor.types.map((type) => <Badge key={type}>{type}</Badge>)}</div><h2 className="mt-4 text-xl font-extrabold">{vendor.businessName}</h2><p className="mt-1 text-sm text-muted-foreground">{vendor.owner.name} · {vendor.contactPhone}</p><p className="mt-3 text-sm">{vendor._count.vehicles} vehicles · {vendor._count.hotels} hotels · {vendor._count.packages} packages</p></div><form action={setVendorApproval}><input type="hidden" name="vendorId" value={vendor.id} /><input type="hidden" name="verified" value={String(!vendor.verified)} /><Button variant={vendor.verified ? "outline" : "default"}>{vendor.verified ? "Revoke verification" : "Approve vendor"}</Button></form></div></Card>)}</div></PortalShell>;
}
