import { ApplicationStatus, Role, VendorType } from "@prisma/client";
import type { getActor } from "@/lib/auth";

export type NavLink = { href: string; label: string };

export type LandingCta = {
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export type ActorContext = NonNullable<Awaited<ReturnType<typeof getActor>>>;

export function getRoleHomePath(role: Role | string | undefined): string {
  if (role === Role.ADMIN) return "/approvals";
  if (role === Role.VENDOR) return "/dashboard";
  if (role === Role.CUSTOMER) return "/home";
  return "/";
}

export function resolvePostLoginRedirect(requested: string, role: Role | string | undefined): string {
  const safe = requested.startsWith("/") ? requested : "/";
  if (safe !== "/") return safe;
  return getRoleHomePath(role);
}

export function getPublicNav(actor: ActorContext | null): NavLink[] {
  if (!actor) {
    return [
      { href: "/regions/gilgit-baltistan", label: "Regions" },
      { href: "/packages", label: "Packages" },
      { href: "/trip-builder", label: "Trip builder" },
    ];
  }

  if (actor.role === Role.ADMIN) {
    return [
      { href: "/approvals", label: "Approvals" },
      { href: "/analytics", label: "Analytics" },
    ];
  }

  if (actor.role === Role.VENDOR) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/vendor/packages", label: "My Tours" },
      { href: "/bookings", label: "Bookings" },
    ];
  }

  const links: NavLink[] = [
    { href: "/home", label: "Home" },
    { href: "/regions/gilgit-baltistan", label: "Regions" },
    { href: "/packages", label: "Packages" },
    { href: "/trip-builder", label: "Trip builder" },
    { href: "/bookings", label: "Bookings" },
  ];

  const latestApplication = actor.vendorApplications[0];
  const canApplyAsVendor =
    actor.role === Role.CUSTOMER &&
    (!latestApplication || latestApplication.status === ApplicationStatus.REJECTED);

  if (canApplyAsVendor) {
    links.push({ href: "/profile#vendor-application", label: "Become a vendor" });
  }

  return links;
}

export function getExploreCtaHref(actor: ActorContext | null): string | null {
  if (!actor || actor.role === Role.CUSTOMER) return "/packages";
  return null;
}

export type PortalNavItem = { href: string; label: string; iconKey: string };

const PORTAL_LINKS: Record<string, PortalNavItem> = {
  overview: { href: "/dashboard", label: "Overview", iconKey: "overview" },
  fleet: { href: "/fleet", label: "Fleet & fares", iconKey: "fleet" },
  hotels: { href: "/hotels", label: "Hotels", iconKey: "hotels" },
  guide: { href: "/guide-profile", label: "Guide profile", iconKey: "guide" },
  camps: { href: "/camps", label: "Camps", iconKey: "camps" },
  packages: { href: "/vendor/packages", label: "Packages", iconKey: "packages" },
  bookings: { href: "/bookings", label: "Bookings", iconKey: "bookings" },
};

export function getPortalNav(vendorTypes: VendorType[] = [], admin = false): PortalNavItem[] {
  if (admin) {
    return [
      { href: "/approvals", label: "Approvals", iconKey: "approvals" },
      { href: "/analytics", label: "Analytics", iconKey: "analytics" },
    ];
  }

  const items: PortalNavItem[] = [PORTAL_LINKS.overview];
  if (vendorTypes.includes(VendorType.TRANSPORT)) items.push(PORTAL_LINKS.fleet);
  if (vendorTypes.includes(VendorType.HOTEL)) items.push(PORTAL_LINKS.hotels);
  if (vendorTypes.includes(VendorType.GUIDE)) items.push(PORTAL_LINKS.guide);
  if (vendorTypes.includes(VendorType.CAMP)) items.push(PORTAL_LINKS.camps);
  if (vendorTypes.length > 0) items.push(PORTAL_LINKS.packages);
  items.push(PORTAL_LINKS.bookings);
  return items;
}

export function getLandingCta(actor: ActorContext | null, bookingCount: number): LandingCta {
  if (!actor) {
    return { primary: { href: "/sign-up", label: "Get Started" } };
  }

  if (actor.role === Role.ADMIN) {
    return {
      primary: { href: "/approvals", label: "Go to Approvals" },
      secondary: { href: "/trip-builder", label: "Explore Plans" },
    };
  }

  if (actor.role === Role.VENDOR) {
    return { primary: { href: "/dashboard", label: "Go to Dashboard" } };
  }

  const cta: LandingCta = {
    primary: { href: "/trip-builder", label: "Explore Plans" },
  };

  if (bookingCount > 0) {
    cta.secondary = { href: "/bookings", label: "My Bookings" };
  }

  return cta;
}

export function getAccountMenuLinks(role: Role | string | undefined): NavLink[] {
  if (role === Role.ADMIN) {
    return [
      { href: "/profile", label: "Profile" },
      { href: "/approvals", label: "Approvals" },
      { href: "/analytics", label: "Analytics" },
    ];
  }

  if (role === Role.VENDOR) {
    return [
      { href: "/profile", label: "Profile" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/bookings", label: "Bookings" },
    ];
  }

  return [
    { href: "/home", label: "Home" },
    { href: "/profile", label: "Profile" },
    { href: "/bookings", label: "Bookings" },
  ];
}
