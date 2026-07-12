import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encode as defaultEncode } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";
import { Role } from "@prisma/client";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { getDefaultMaxAgeSeconds, getRememberMeMaxAgeSeconds } from "@/lib/auth-session";
import { authConfig } from "@/auth.config";

const db = getDb();
const adapter = db ? (PrismaAdapter(db) as Adapter) : undefined;

// Cookie Max-Age uses the remember-me ceiling; actual short-session validity is Session.expires in the DB.
const rememberMeMaxAge = getRememberMeMaxAgeSeconds();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  // With an adapter and no explicit strategy, Auth.js uses database-backed sessions.
  // We avoid setting strategy: "database" explicitly so the Credentials provider guard
  // is not tripped; the jwt.encode override below still persists a real Session row.
  session: { maxAge: rememberMeMaxAge },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const client = getDb();
        if (!client) return null;
        const user = await client.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          rememberMe: String(credentials?.rememberMe ?? "") === "true",
        };
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: Role }).role ?? Role.CUSTOMER;
        // Never leak the password hash to the client via the session response.
        delete (session.user as unknown as Record<string, unknown>).passwordHash;
      }
      return session;
    },
    // Flag credentials logins so the encode override below persists a DB session.
    async jwt({ token, user, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
        token.rememberMe = (user as { rememberMe?: boolean } | undefined)?.rememberMe ?? false;
      }
      return token;
    },
  },
  jwt: {
    // The Credentials provider does not create database sessions on its own.
    // Intercept encoding to create a real Session row and return its token as the cookie value.
    async encode(params) {
      if (!params.token?.credentials) return defaultEncode(params);
      const userId = params.token.sub;
      if (!userId) throw new Error("No user id in token.");
      const client = getDb();
      if (!client) throw new Error("Database is not configured.");
      const lifetime = params.token.rememberMe ? getRememberMeMaxAgeSeconds() : getDefaultMaxAgeSeconds();
      const sessionToken = crypto.randomUUID();
      await client.session.create({
        data: { sessionToken, userId, expires: new Date(Date.now() + lifetime * 1000) },
      });
      return sessionToken;
    },
  },
});
