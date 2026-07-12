import { getActor } from "@/lib/auth";
import { getAccountMenuLinks, getExploreCtaHref, getPublicNav } from "@/lib/navigation";
import { InnerHeader } from "@/components/inner-header";

export async function InnerHeaderShell() {
  const actor = await getActor();
  const navLinks = getPublicNav(actor);
  const exploreHref = getExploreCtaHref(actor);
  const accountMenuLinks = getAccountMenuLinks(actor?.role);

  return <InnerHeader navLinks={navLinks} exploreHref={exploreHref} accountMenuLinks={accountMenuLinks} />;
}
