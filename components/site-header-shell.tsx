import { getActor } from "@/lib/auth";
import { getAccountMenuLinks, getExploreCtaHref, getPublicNav } from "@/lib/navigation";
import { SiteHeader } from "@/components/site-header";

export async function SiteHeaderShell() {
  const actor = await getActor();
  const navLinks = getPublicNav(actor);
  const exploreHref = getExploreCtaHref(actor);
  const accountMenuLinks = getAccountMenuLinks(actor?.role);

  return <SiteHeader navLinks={navLinks} exploreHref={exploreHref} accountMenuLinks={accountMenuLinks} />;
}
