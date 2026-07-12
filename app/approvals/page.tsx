import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ApplicationStatus, Role } from "@prisma/client";
import { AccessPanel } from "@/components/access-panel";
import { ApproveApplicationButton, RejectApplicationForm } from "@/components/admin-application-actions";
import { PortalShell } from "@/components/portal-shell";
import { WelcomeToast } from "@/components/welcome-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Tab = "pending" | "approved" | "rejected";

function tabHref(tab: Tab) {
  return tab === "pending" ? "/approvals" : `/approvals?tab=${tab}`;
}

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const actor = await getActor();
  if (!actor || actor.role !== Role.ADMIN) return <PortalShell admin><AccessPanel /></PortalShell>;

  const tabParam = (await searchParams).tab;
  const tab: Tab = tabParam === "approved" || tabParam === "rejected" ? tabParam : "pending";

  const db = getDb();
  const applications = db
    ? await db.vendorApplication.findMany({
        where: { status: tab === "pending" ? ApplicationStatus.PENDING : tab === "approved" ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED },
        include: { user: true },
        orderBy: tab === "pending" ? { createdAt: "asc" } : { reviewedAt: "desc" },
      })
    : [];

  return (
    <PortalShell admin>
      <WelcomeToast />
      <p className="eyebrow text-[#5a7f73]">Admin control</p>
      <h1 className="display-title mt-2 text-6xl">Vendor applications</h1>
      <p className="mt-4 text-muted-foreground">Review pending applications first. Approved and rejected history is available in the tabs below.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {([
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ] as const).map(([value, label]) => (
          <Button key={value} asChild variant={tab === value ? "default" : "outline"} size="sm">
            <Link href={tabHref(value)}>{label}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-4">
        {applications.length === 0 && (
          <Card className="p-8 text-sm text-muted-foreground">
            {tab === "pending" ? "No pending applications right now." : `No ${tab} applications yet.`}
          </Card>
        )}
        {applications.map((application) => (
          <Card key={application.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {application.requestedTypes.map((type) => <Badge key={type}>{type}</Badge>)}
                  <Badge>{application.status}</Badge>
                </div>
                <h2 className="mt-4 text-xl font-extrabold">{application.businessName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.user.name} · {application.user.email}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Submitted {application.createdAt.toLocaleDateString()}
                {application.reviewedAt && <> · Reviewed {application.reviewedAt.toLocaleDateString()}</>}
              </p>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold">Phone</dt><dd className="text-muted-foreground">{application.phone}</dd></div>
              <div><dt className="font-bold">CNIC</dt><dd className="text-muted-foreground">{application.cnic}</dd></div>
              {application.reviewedAt && (
                <div><dt className="font-bold">Reviewed</dt><dd className="text-muted-foreground">{application.reviewedAt.toLocaleDateString()}</dd></div>
              )}
            </dl>
            <div className="mt-3 text-sm">
              <p className="font-bold">Business description</p>
              <p className="mt-1 leading-6 text-muted-foreground">{application.description}</p>
            </div>
            {application.rejectionNote && (
              <p className="mt-3 rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#a53434]">{application.rejectionNote}</p>
            )}
            {application.documentUrl && (
              <a href={application.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#397668] hover:underline">
                View supporting document <ExternalLink size={14} />
              </a>
            )}

            {tab === "pending" && (
              <div className="mt-6 flex flex-col gap-3 border-t border-primary/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <RejectApplicationForm applicationId={application.id} />
                <ApproveApplicationButton applicationId={application.id} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
