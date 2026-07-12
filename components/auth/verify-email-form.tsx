"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { confirmEmailOtp, resendEmailOtp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify, setFlash } from "@/lib/notify";
import { resendEmailOtpSchema, verifyEmailOtpSchema } from "@/lib/validation";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    formData.set("email", email);

    const parsed = verifyEmailOtpSchema.safeParse({
      email,
      code: formData.get("code"),
    });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
      setError(message);
      notify.error(message);
      setPending(false);
      return;
    }

    const result = await confirmEmailOtp({}, formData);
    if (result.error) {
      setError(result.error);
      notify.error("Verification failed", result.error);
      setPending(false);
      return;
    }

    setFlash({
      type: "success",
      message: "Email verified",
      description: "Your account is ready. Sign in to continue.",
    });
    router.push("/sign-in?email=" + encodeURIComponent(email));
    router.refresh();
  }

  async function handleResend() {
    setError(undefined);
    setResendPending(true);

    const parsed = resendEmailOtpSchema.safeParse({ email });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a valid email address.";
      setError(message);
      notify.error(message);
      setResendPending(false);
      return;
    }

    const formData = new FormData();
    formData.set("email", email);
    const result = await resendEmailOtp({}, formData);
    if (result.error) {
      setError(result.error);
      notify.error("Could not resend code", result.error);
      setResendPending(false);
      return;
    }

    if (result.delivery === "resend") {
      notify.success("Code sent", "Check your inbox and spam folder for a new 6-digit code.");
    } else if (result.delivery === "console" || result.delivery === "console-fallback") {
      notify.info("Code printed in the server terminal", "Copy the OTP from the npm run dev console.");
    } else {
      notify.info("Could not email the code", "Check the server terminal or try again in a minute.");
    }
    setResendPending(false);
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="grid gap-2 text-sm font-bold">
          6-digit code
          <Input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            pattern="\d{6}"
            placeholder="123456"
            className="tracking-[0.35em]"
          />
        </label>
        {error && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#a53434]">{error}</p>}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Verifying…" : "Verify email"}
        </Button>
      </form>
      <Button type="button" variant="outline" size="lg" disabled={resendPending} onClick={() => void handleResend()}>
        {resendPending ? "Sending…" : "Resend code"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/sign-up" className="font-bold text-[#397668] hover:underline">
          Sign up again
        </Link>
      </p>
    </div>
  );
}
