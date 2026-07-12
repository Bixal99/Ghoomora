import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const hasToken = Boolean(token?.trim());

  return (
    <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-primary">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary">
            <MountainSnow size={21} />
          </span>
          Ghoomora
        </Link>
        <Card className="p-8">
          <h1 className="display-title text-4xl">Choose a new password</h1>
          {hasToken ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">Pick a password at least 8 characters long.</p>
              <div className="mt-7">
                <ResetPasswordForm token={token!.trim()} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                This reset link is missing or invalid. Request a new password reset email to continue.
              </p>
              <Button asChild size="lg" className="mt-7 w-full">
                <Link href="/forgot-password">Request reset link</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
