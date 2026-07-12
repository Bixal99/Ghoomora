"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/app/actions/auth";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { notify, setFlash } from "@/lib/notify";
import { resetPasswordSchema } from "@/lib/validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    const parsed = resetPasswordSchema.safeParse({
      token,
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

    const result = await resetPassword({}, formData);
    if (result.error) {
      setError(result.error);
      notify.error("Could not update password", result.error);
      setPending(false);
      return;
    }

    setFlash({
      type: "success",
      message: "Password saved",
      description: "Sign in with your new password.",
    });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <label className="grid gap-2 text-sm font-bold">
        New password
        <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Confirm password
        <PasswordInput name="confirmPassword" autoComplete="new-password" required minLength={8} />
      </label>
      {error && <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-bold text-[#a53434]">{error}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need a new link?{" "}
        <Link href="/forgot-password" className="font-bold text-[#397668] hover:underline">
          Request reset
        </Link>
      </p>
    </form>
  );
}
