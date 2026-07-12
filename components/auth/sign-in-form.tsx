"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { getCredentialsLoginHint } from "@/app/actions/auth";
import { setWelcomeFlag } from "@/components/app-toasts";
import { AuthProviderDivider, GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { notify, setFlash } from "@/lib/notify";
import { resolvePostLoginRedirect } from "@/lib/navigation";
import { signInSchema } from "@/lib/validation";

export function SignInForm({
  redirectTo,
  signUpHref,
  googleEnabled = false,
  defaultEmail = "",
}: {
  redirectTo: string;
  signUpHref: string;
  googleEnabled?: boolean;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Please check the form and try again.";
      setError(message);
      notify.error(message);
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: String(parsed.data.rememberMe),
      redirect: false,
    });

    if (result?.error) {
      const hint = await getCredentialsLoginHint(parsed.data.email);
      if (hint === "unverified") {
        const message = "Verify your email before signing in.";
        setError(message);
        setFlash({ type: "info", message: "Email not verified", description: "Enter the 6-digit code we sent you." });
        setPending(false);
        router.push("/verify-email?email=" + encodeURIComponent(parsed.data.email));
        return;
      }
      setError("Invalid email or password.");
      notify.error("Sign in failed", "Invalid email or password.");
      setPending(false);
      return;
    }

    const session = await getSession();
    setWelcomeFlag(session?.user?.name);
    const destination = resolvePostLoginRedirect(redirectTo, session?.user?.role);
    router.push(destination);
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
          Email
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue={defaultEmail}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password
          <PasswordInput name="password" autoComplete="current-password" required />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 font-medium text-muted-foreground">
            <input type="checkbox" name="rememberMe" className="size-4 accent-[#173f35]" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-bold text-[#397668] hover:underline">
            Forgot password?
          </Link>
        </div>
        {error && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#a53434]">{error}</p>}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to Ghoomora?{" "}
          <Link href={signUpHref} className="font-bold text-[#397668] hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
