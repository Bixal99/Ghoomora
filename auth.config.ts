import type { NextAuthConfig } from "next-auth";

// Edge/proxy-safe config: no database adapter, no Node-only imports.
// Providers are added in auth.ts where the Prisma adapter lives.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
