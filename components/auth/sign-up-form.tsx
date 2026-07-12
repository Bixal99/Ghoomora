"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerUser } from "@/app/actions/auth";
import { AuthProviderDivider, GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import type { EmailDeliveryMode } from "@/lib/email-types";
import { notify, setFlash } from "@/lib/notify";
import { signUpSchema } from "@/lib/validation";

function flashForDelivery(delivery?: EmailDeliveryMode) {
  if (delivery === "resend") {
    return {
      type: "success" as const,
      message: "Verification code sent",
      description: "Check your inbox and spam folder for a 6-digit code.",
    };
  }
  if (delivery === "console" || delivery === "console-fallback") {
    return {
      type: "info" as const,
      message: "Code printed in the server terminal",
      description: "Resend test mode can’t mail this address yet. Copy the OTP from the npm run dev console.",
    };
  }
  return {
    type: "info" as const,
    message: "Continue to verification",
    description: "We couldn’t email the code. Use Resend code on the next screen, or check the server terminal.",
  };
}

export function SignUpForm({
  redirectTo,
  signInHref,
  googleEnabled = false,
}: {
  redirectTo: string;
  signInHref: string;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
      setError(message);
      notify.error(message);
      setPending(false);
      return;
    }

    const { name, email, password } = parsed.data;
    const registerFormData = new FormData();
    registerFormData.set("name", name);
    registerFormData.set("email", email);
    registerFormData.set("password", password);
    registerFormData.set("confirmPassword", parsed.data.confirmPassword);

    const registerResult = await registerUser({}, registerFormData);
    if (registerResult.error) {
      setError(registerResult.error);
      notify.error("Could not create account", registerResult.error);
      setPending(false);
      return;
    }

    setFlash(flashForDelivery(registerResult.delivery));
    router.push("/verify-email?email=" + encodeURIComponent(registerResult.email ?? email));
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      {googleEnabled && (
        <>
          <GoogleSignInButton callbackUrl={redirectTo} />
          <AuthProviderDivider />
        </>
      )}
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-bold">
          Full name
          <Input type="text" name="name" autoComplete="name" required minLength={2} placeholder="Ayesha Khan" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <Input type="email" name="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password
          <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Confirm password
          <PasswordInput name="confirmPassword" autoComplete="new-password" required minLength={8} />
        </label>
        {error && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#a53434]">{error}</p>}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={signInHref} className="font-bold text-[#397668] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
