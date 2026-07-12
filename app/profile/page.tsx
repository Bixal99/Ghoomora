import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock3, ShieldCheck, Store } from "lucide-react";
import { ApplicationStatus, Role } from "@prisma/client";
import { submitVendorApplication } from "@/app/actions/application";
import { InnerHeader } from "@/components/inner-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getActor } from "@/lib/auth";

export const dynamic = "force-dynamic";

const levelCopy: Record<string, string> = {
  EXPLORER: "Explorer — just getting started in the mountains.",
  MOUNTAIN_GOAT: "Mountain Goat — seasoned across multiple completed journeys.",
  LEGEND: "Legend — a true Northern Pakistan regular.",
};

const VENDOR_TYPES = ["TRANSPORT", "HOTEL", "GUIDE", "CAMP"] as const;

function ApplicationForm({ heading, note }: { heading: string; note?: string }) {
  return (
    <Card className="mt-6 p-7">
      <div className="flex items-center gap-2">
        <Store className="text-[#397668]" size={20} />
        <h2 className="text-xl font-extrabold">{heading}</h2>
      </div>
      {note && <p className="mt-2 text-sm text-muted-foreground">{note}</p>}
      <form action={submitVendorApplication} className="mt-5 grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          Business name
          <Input name="businessName" required minLength={3} placeholder="Northbound Expeditions" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Contact phone
          <Input name="phone" required placeholder="+92 300 0000000" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          CNIC
          <Input name="cnic" required placeholder="35202-1234567-1" />
        </label>
        <fieldset>
          <legend className="text-sm font-bold">Services you operate</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {VENDOR_TYPES.map((type) => (
              <label key={type} className="rounded-xl border bg-white p-3 text-sm font-bold">
                <input name="requestedTypes" value={type} type="checkbox" className="mr-2 accent-[#173f35]" />
                {type}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-2 text-sm font-bold">
          About your business
          <textarea
            name="description"
            rows={4}
            required
            minLength={20}
            className="focus-ring w-full rounded-xl border border-primary/15 bg-white p-3 text-sm shadow-sm"
            placeholder="Tell us what you operate, where, and why travelers should trust you."
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Supporting document (optional)
          <input
            name="document"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-bold"
          />
          <span className="text-xs font-medium text-muted-foreground">PDF or image, up to 8 MB.</span>
        </label>
        <Button size="lg">Submit application</Button>
      </form>
    </Card>
  );
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?redirect_url=/profile");
  const notice = (await searchParams).notice;
  const latestApplication = actor.vendorApplications[0];
  const isVendor = actor.role === Role.VENDOR;
  const isCustomer = actor.role === Role.CUSTOMER;
  const pending = latestApplication?.status === ApplicationStatus.PENDING;
  const rejected = latestApplication?.status === ApplicationStatus.REJECTED;

  return (
    <>
      <InnerHeader />
      <main className="section-pad min-h-screen bg-[#e5eee9]">
        <div className="container-shell max-w-3xl">
          <p className="eyebrow text-[#5a7f73]">Traveler profile</p>
          <h1 className="display-title mt-2 text-6xl">{actor.name}</h1>

          {notice && <div className="mt-6 rounded-xl bg-[#dff1e9] p-4 text-sm font-bold text-[#23594c]">{notice}</div>}

          <Card className="mt-8 p-7">
            <Badge>{actor.travelerLevel.replace("_", " ")}</Badge>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{levelCopy[actor.travelerLevel] ?? levelCopy.EXPLORER}</p>
            <p className="mt-4 text-2xl font-extrabold">{actor.completedTripsCount} completed trip{actor.completedTripsCount === 1 ? "" : "s"}</p>
            {actor.badges.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{actor.badges.map((badge) => <Badge key={badge}>{badge.replace(/-/g, " ")}</Badge>)}</div>}
          </Card>

          {isVendor && (
            <Card className="mt-6 p-7">
              <div className="flex items-center gap-2 text-[#23594c]"><ShieldCheck size={20} /><h2 className="text-xl font-extrabold">You are a verified vendor</h2></div>
              <p className="mt-2 text-sm text-muted-foreground">Manage your fleet, hotels, camps, guide profile and packages from the partner dashboard.</p>
              <Button asChild className="mt-5"><Link href="/dashboard">Go to dashboard <ArrowRight size={16} /></Link></Button>
            </Card>
          )}

          {isCustomer && pending && (
            <Card className="mt-6 p-7">
              <div className="flex items-center gap-2 text-[#805b21]"><Clock3 size={20} /><h2 className="text-xl font-extrabold">Application under review</h2></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your vendor application for <span className="font-bold">{latestApplication.businessName}</span> is with our team. You will gain access to the partner dashboard once it is approved.
              </p>
            </Card>
          )}

          {isCustomer && rejected && (
            <>
              <Card className="mt-6 p-7">
                <div className="flex items-center gap-2 text-[#a53434]"><ShieldCheck size={20} /><h2 className="text-xl font-extrabold">Application not approved</h2></div>
                <p className="mt-2 text-sm text-muted-foreground">Your previous application was not approved.</p>
                {latestApplication.rejectionNote && (
                  <p className="mt-3 rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-medium text-[#a53434]">{latestApplication.rejectionNote}</p>
                )}
              </Card>
              <ApplicationForm heading="Reapply as a vendor" note="Update your details below and submit a fresh application." />
            </>
          )}

          {isCustomer && !pending && !rejected && (
            <ApplicationForm heading="Become a vendor" note="Operate transport, hotels, guides or camps? Apply to list on Ghoomora." />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
