"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { forgotPasswordSchema } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a valid email address.";
      setError(message);
      notify.error(message);
      setPending(false);
      return;
    }

    const result = await requestPasswordReset({}, formData);
    if (result.error) {
      setError(result.error);
      notify.error("Could not send reset link", result.error);
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
    notify.success("Reset link sent", "If an email/password account exists for that address, check your inbox and spam folder.");
  }

  if (sent) {
    return (
      <div className="grid gap-5 text-center">
        <p className="rounded-xl bg-[#e8efe9] px-4 py-3 text-sm leading-6 text-[#153f34]">
          If an email/password account exists for that address, we sent a reset link. Check inbox and spam.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Signed up with Google? There is no Ghoomora password to reset — use{" "}
          <Link href="/sign-in" className="font-bold text-[#397668] hover:underline">
            Continue with Google
          </Link>{" "}
          on the sign-in page.
        </p>
        <Button asChild size="lg">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold">
        Email
        <Input type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <p className="text-sm leading-6 text-muted-foreground">
        Only for accounts created with email and password. Google sign-in users should use Continue with Google instead.
      </p>
      {error && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#a53434]">{error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-bold text-[#397668] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
