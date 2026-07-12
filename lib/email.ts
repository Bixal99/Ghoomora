import "server-only";
import { Resend } from "resend";
import type { EmailDeliveryMode } from "@/lib/email-types";

export type { EmailDeliveryMode } from "@/lib/email-types";

export type EmailSendResult = { ok: true; mode: Exclude<EmailDeliveryMode, "failed"> };

function isResendTestRecipientRestriction(detail: string) {
  return /only send testing emails|verify a domain|own email address/i.test(detail);
}

async function sendWithResend({
  to,
  subject,
  html,
  text,
  logLabel,
  consoleFallback,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  logLabel: string;
  consoleFallback: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.info(`[${logLabel}] Resend not configured. ${consoleFallback}`);
    return { ok: true, mode: "console" };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html, text });

  if (error) {
    console.error(`[${logLabel}] Resend error:`, error);
    const detail =
      typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message) : "";

    if (isResendTestRecipientRestriction(detail)) {
      console.info(
        `[${logLabel}] Resend test mode cannot mail this recipient — using console fallback. ${consoleFallback}`,
      );
      return { ok: true, mode: "console-fallback" };
    }

    throw new Error(detail || `Failed to send ${logLabel} email.`);
  }

  return { ok: true, mode: "resend" };
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  return sendWithResend({
    to,
    subject: "Reset your Ghoomora password",
    html: [
      "<p>We received a request to reset your Ghoomora password.</p>",
      `<p><a href="${resetUrl}">Choose a new password</a></p>`,
      "<p>This link expires in one hour. If you did not request a reset, you can ignore this email.</p>",
    ].join(""),
    text: `Reset your Ghoomora password: ${resetUrl}\n\nThis link expires in one hour. If you did not request a reset, ignore this email.`,
    logLabel: "password-reset",
    consoleFallback: `Reset link for ${to}: ${resetUrl}`,
  });
}

export async function sendEmailOtp({ to, code }: { to: string; code: string }) {
  return sendWithResend({
    to,
    subject: "Your Ghoomora verification code",
    html: [
      "<p>Use this code to verify your Ghoomora account:</p>",
      `<p style="font-size:24px;font-weight:700;letter-spacing:0.2em">${code}</p>`,
      "<p>This code expires in 10 minutes. If you did not create an account, you can ignore this email.</p>",
    ].join(""),
    text: `Your Ghoomora verification code is ${code}. It expires in 10 minutes.`,
    logLabel: "email-otp",
    consoleFallback: `OTP for ${to}: ${code}`,
  });
}
