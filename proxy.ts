import { NextResponse } from "next/server";
import { auth } from "@/auth";

const AUTH_REQUIRED = ["/checkout", "/bookings", "/profile"];
const VENDOR_PATHS = ["/dashboard", "/fleet", "/hotels", "/camps", "/guide-profile", "/vendor"];
const ADMIN_PATHS = ["/approvals", "/analytics"];
const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;
  const signedIn = Boolean(session?.user);

  if (signedIn && matches(pathname, AUTH_PAGES)) {
    const home = role === "ADMIN" ? "/approvals" : role === "VENDOR" ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(home, req.nextUrl));
  }

  if (matches(pathname, ADMIN_PATHS)) {
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.nextUrl));
    return NextResponse.next();
  }

  if (matches(pathname, VENDOR_PATHS)) {
    if (!signedIn) {
      const url = new URL("/sign-in", req.nextUrl);
      url.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "VENDOR" || role === "ADMIN") return NextResponse.next();
    // Signed-in customers land on the dashboard, which shows their application status.
    if (pathname !== "/dashboard") return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  if (matches(pathname, AUTH_REQUIRED) && !signedIn) {
    const url = new URL("/sign-in", req.nextUrl);
    url.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
