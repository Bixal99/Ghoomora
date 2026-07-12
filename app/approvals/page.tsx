import { ExternalLink } from "lucide-react";
import { ApplicationStatus, Role } from "@prisma/client";
import { approveVendorApplication, rejectVendorApplication } from "@/app/actions/admin";
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
  const applications = db
    ? await db.vendorApplication.findMany({
        where: { status: ApplicationStatus.PENDING },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <PortalShell admin>
      <p className="eyebrow text-[#5a7f73]">Admin control</p>
      <h1 className="display-title mt-2 text-6xl">Vendor applications</h1>
      <p className="mt-4 text-muted-foreground">Review each application in full before approving. Approval creates the vendor profile and grants VENDOR access.</p>

      <div className="mt-8 grid gap-4">
        {applications.length === 0 && <Card className="p-8 text-sm text-muted-foreground">No pending applications right now.</Card>}
        {applications.map((application) => (
          <Card key={application.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {application.requestedTypes.map((type) => <Badge key={type}>{type}</Badge>)}
                </div>
                <h2 className="mt-4 text-xl font-extrabold">{application.businessName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.user.name} · {application.user.email}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Submitted {application.createdAt.toLocaleDateString()}</p>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold">Phone</dt><dd className="text-muted-foreground">{application.phone}</dd></div>
              <div><dt className="font-bold">CNIC</dt><dd className="text-muted-foreground">{application.cnic}</dd></div>
            </dl>
            <div className="mt-3 text-sm">
              <p className="font-bold">Business description</p>
              <p className="mt-1 leading-6 text-muted-foreground">{application.description}</p>
            </div>
            {application.documentUrl && (
              <a href={application.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#397668] hover:underline">
                View supporting document <ExternalLink size={14} />
              </a>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-primary/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <form action={rejectVendorApplication} className="grid flex-1 gap-2">
                <input type="hidden" name="applicationId" value={application.id} />
                <label className="text-xs font-bold text-muted-foreground">Rejection note (optional, shown to applicant)</label>
                <div className="flex gap-2">
                  <input name="rejectionNote" className="focus-ring h-11 flex-1 rounded-xl border border-primary/15 bg-white px-3 text-sm" placeholder="Reason for rejection" />
                  <Button variant="outline" type="submit">Reject</Button>
                </div>
              </form>
              <form action={approveVendorApplication}>
                <input type="hidden" name="applicationId" value={application.id} />
                <Button type="submit">Approve application</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
