"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { signUpSchema } from "@/lib/validation";

export function SignUpForm({ redirectTo, signInHref }: { redirectTo: string; signInHref: string }) {
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
      setError(parsed.error.issues[0]?.message ?? "Please check the form and try again.");
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
      setPending(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      rememberMe: "true",
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Account created, but sign-in failed. Please sign in.");
      setPending(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
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
  );
}
