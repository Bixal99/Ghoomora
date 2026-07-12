import "server-only";
import { createHash, randomInt } from "crypto";
import type { PrismaClient } from "@prisma/client";

const OTP_PREFIX = "email-verify:";
const OTP_LOG_PREFIX = "email-verify-log:";
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;

function hashOtp(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function otpIdentifier(email: string) {
  return OTP_PREFIX + email.trim().toLowerCase();
}

function otpLogIdentifier(email: string) {
  return OTP_LOG_PREFIX + email.trim().toLowerCase();
}

function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export type CreateOtpResult =
  | { ok: true; code: string; email: string }
  | { ok: false; error: string };

export async function createEmailOtp(db: PrismaClient, email: string): Promise<CreateOtpResult> {
  const normalized = email.trim().toLowerCase();
  const identifier = otpIdentifier(normalized);
  const logIdentifier = otpLogIdentifier(normalized);
  const now = Date.now();

  const recentSends = await db.verificationToken.count({
    where: { identifier: logIdentifier, expires: { gt: new Date() } },
  });
  if (recentSends >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "Too many verification emails. Try again in about an hour." };
  }

  const existing = await db.verificationToken.findFirst({ where: { identifier } });
  if (existing) {
    const createdAt = existing.expires.getTime() - OTP_TTL_MS;
    if (now - createdAt < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - createdAt)) / 1000);
      return { ok: false, error: `Please wait ${waitSec}s before requesting another code.` };
    }
  }

  const code = generateOtpCode();
  const token = hashOtp(code);
  const expires = new Date(now + OTP_TTL_MS);

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({ data: { identifier, token, expires } });
  await db.verificationToken.create({
    data: {
      identifier: logIdentifier,
      token: `${now}-${token.slice(0, 16)}`,
      expires: new Date(now + 60 * 60 * 1000),
    },
  });

  return { ok: true, code, email: normalized };
}

export async function consumeEmailOtp(db: PrismaClient, email: string, code: string) {
  const normalized = email.trim().toLowerCase();
  const identifier = otpIdentifier(normalized);
  const token = hashOtp(code.trim());

  const row = await db.verificationToken.findFirst({
    where: { identifier, token, expires: { gt: new Date() } },
  });
  if (!row) return false;

  await db.verificationToken.deleteMany({ where: { identifier } });
  return true;
}
