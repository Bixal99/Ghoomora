import { notFound, redirect } from "next/navigation";
import { InnerHeader } from "@/components/inner-header";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { getActor } from "@/lib/auth";
import { getPackage } from "@/lib/data";
import { resolveBookingPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?redirect_url=/checkout");
  const params = await searchParams;
  const packageId = typeof params.packageId === "string" ? params.packageId : "";
  const tierId = typeof params.tierId === "string" ? params.tierId : "";
  const pickupCity = typeof params.pickupCity === "string" ? params.pickupCity : "islamabad";
  const days = typeof params.days === "string" ? Number(params.days) : 5;
  const travelers = typeof params.travelers === "string" ? Number(params.travelers) : 2;
  const pkg = await getPackage(packageId);
  if (!pkg || !tierId) notFound();
  const estimate = await resolveBookingPrice({ packageId, tierId, pickupCitySlug: pickupCity, selectedDays: days, travelerCount: travelers });
  if (!estimate.canCheckout) notFound();

  return (
    <>
      <InnerHeader />
      <main className="section-pad bg-[#e5eee9] min-h-screen">
        <div className="container-shell">
          <p className="eyebrow text-[#5a7f73]">Secure checkout</p>
          <h1 className="display-title mt-2 text-6xl">Confirm your journey.</h1>
          <div className="mt-10">
            <CheckoutForm pkg={pkg} tierId={tierId} pickupCitySlug={pickupCity} selectedDays={days} travelerCount={travelers} estimate={estimate} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
