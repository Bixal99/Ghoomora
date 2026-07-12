import "server-only";
import { createHash, randomBytes } from "crypto";
import type { PrismaClient } from "@prisma/client";

const RESET_PREFIX = "password-reset:";
const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

function resetIdentifier(email: string) {
  return RESET_PREFIX + email.trim().toLowerCase();
}

function appBaseUrl() {
  return (process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function buildResetPasswordUrl(rawToken: string) {
  return `${appBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export async function createResetToken(db: PrismaClient, email: string) {
  const normalized = email.trim().toLowerCase();
  const identifier = resetIdentifier(normalized);
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({ data: { identifier, token, expires } });

  return { rawToken, email: normalized, resetUrl: buildResetPasswordUrl(rawToken) };
}

export async function consumeResetToken(db: PrismaClient, rawToken: string) {
  const token = hashToken(rawToken);
  const row = await db.verificationToken.findFirst({
    where: { token, expires: { gt: new Date() } },
  });

  if (!row || !row.identifier.startsWith(RESET_PREFIX)) {
    return null;
  }

  await db.verificationToken.deleteMany({
    where: { identifier: row.identifier, token: row.token },
  });

  return row.identifier.slice(RESET_PREFIX.length);
}
