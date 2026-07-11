import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth is enforced per route via getActor/requireActor in pages, layouts, and server actions.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
