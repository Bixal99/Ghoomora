import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: rawEmail } = await searchParams;
  const email = rawEmail?.trim().toLowerCase() ?? "";
  const showDevHint = process.env.NODE_ENV !== "production";

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
          <h1 className="display-title text-4xl">Check your email</h1>
          {email ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 6-digit code we sent to <span className="font-bold text-foreground">{email}</span>. It expires in
                10 minutes.
              </p>
              {showDevHint && (
                <p className="mt-4 rounded-xl bg-[#fff4dc] px-4 py-3 text-sm leading-6 text-[#5c4818]">
                  No email yet? With Resend’s test sender, codes for other addresses are printed in the{" "}
                  <span className="font-bold">npm run dev</span> terminal as{" "}
                  <span className="font-bold">[email-otp] … OTP for …</span>
                </p>
              )}
              <div className="mt-7">
                <VerifyEmailForm email={email} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Open this page from the link after sign-up, or start again with your email address.
              </p>
              <Button asChild size="lg" className="mt-7 w-full">
                <Link href="/sign-up">Back to sign up</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
