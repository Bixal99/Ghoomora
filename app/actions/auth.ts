"use server";

import { Role } from "@prisma/client";
import { signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { sendEmailOtp, sendPasswordResetEmail } from "@/lib/email";
import type { EmailDeliveryMode } from "@/lib/email-types";
import { consumeEmailOtp, createEmailOtp } from "@/lib/email-otp";
import { hashPassword } from "@/lib/password";
import { consumeResetToken, createResetToken } from "@/lib/password-reset";
import {
  forgotPasswordSchema,
  resendEmailOtpSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailOtpSchema,
} from "@/lib/validation";

export type AuthFormState = {
  error?: string;
  ok?: boolean;
  email?: string;
  delivery?: EmailDeliveryMode;
};

async function sendOtpAndReport(email: string, code: string): Promise<EmailDeliveryMode> {
  try {
    const result = await sendEmailOtp({ to: email, code });
    return result.mode;
  } catch (error) {
    console.error("[email-otp] send failed:", error);
    return "failed";
  }
}

export async function registerUser(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.emailVerified) return { error: "An account with this email already exists." };
  if (existing && !existing.emailVerified && existing.passwordHash) {
    const passwordHash = await hashPassword(password);
    await db.user.update({
      where: { email },
      data: { name, passwordHash },
    });
    const otp = await createEmailOtp(db, email);
    if (!otp.ok) return { error: otp.error };
    const delivery = await sendOtpAndReport(email, otp.code);
    return { ok: true, email, delivery };
  }
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  await db.user.create({
    data: { name, email, passwordHash, role: Role.CUSTOMER, emailVerified: null },
  });

  const otp = await createEmailOtp(db, email);
  if (!otp.ok) return { error: otp.error };

  const delivery = await sendOtpAndReport(email, otp.code);
  return { ok: true, email, delivery };
}

export async function confirmEmailOtp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = verifyEmailOtpSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { email, code } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { error: "No pending account found for that email." };
  }
  if (user.emailVerified) {
    return { ok: true, email };
  }

  const valid = await consumeEmailOtp(db, email, code);
  if (!valid) {
    return { error: "That code is invalid or has expired." };
  }

  await db.user.update({ where: { email }, data: { emailVerified: new Date() } });
  return { ok: true, email };
}

export async function resendEmailOtp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = resendEmailOtpSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { ok: true, email };
  }
  if (user.emailVerified) {
    return { error: "This email is already verified. You can sign in." };
  }

  const otp = await createEmailOtp(db, email);
  if (!otp.ok) return { error: otp.error };

  const delivery = await sendOtpAndReport(email, otp.code);
  return { ok: true, email, delivery };
}

export async function getCredentialsLoginHint(email: string): Promise<"unverified" | "invalid" | "ok"> {
  const db = getDb();
  if (!db) return "invalid";
  const normalized = email.trim().toLowerCase();
  if (!normalized) return "invalid";
  const user = await db.user.findUnique({ where: { email: normalized } });
  if (!user?.passwordHash) return "invalid";
  if (!user.emailVerified) return "unverified";
  return "ok";
}

export async function requestPasswordReset(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (user?.passwordHash && user.emailVerified) {
    try {
      const { resetUrl } = await createResetToken(db, email);
      await sendPasswordResetEmail({ to: email, resetUrl });
    } catch (error) {
      console.error("[password-reset] request failed:", error);
      const detail = error instanceof Error ? error.message : "";
      if (/only send testing emails|verify a domain|not authorized|invalid.*from/i.test(detail)) {
        return {
          error:
            "Email could not be delivered. With Resend’s test sender (resend.dev), you can only mail your own Resend account address — verify a domain and set EMAIL_FROM to that address, or request reset using that mailbox.",
        };
      }
      return { error: "We could not send a reset email right now. Please try again shortly." };
    }
  } else if (user && !user.passwordHash) {
    // Google (or other OAuth) accounts have no local password — nothing to email.
    console.info(`[password-reset] skipped for OAuth-only account: ${email}`);
  }

  return { ok: true };
}

export async function resetPassword(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const email = await consumeResetToken(db, parsed.data.token);
  if (!email) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !user.emailVerified) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({ where: { email }, data: { passwordHash } });

  return { ok: true };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
