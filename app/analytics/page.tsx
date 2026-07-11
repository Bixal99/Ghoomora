import { notFound, redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { PortalShell } from "@/components/portal-shell";
import { getActor } from "@/lib/auth";
import { getAnalyticsSnapshot } from "@/lib/analytics";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const actor = await getActor();
  if (!actor || actor.role !== Role.ADMIN) redirect("/");
  const data = await getAnalyticsSnapshot();
  if (!data) notFound();
  return (
    <PortalShell>
      <p className="eyebrow text-[#5a7f73]">Admin intelligence</p>
      <h1 className="display-title mt-2 text-6xl">Platform analytics</h1>
      <div className="mt-8"><AnalyticsDashboard data={data} /></div>
    </PortalShell>
  );
}
