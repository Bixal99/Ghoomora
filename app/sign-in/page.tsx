import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card } from "@/components/ui/card";
import { isGoogleAuthConfigured } from "@/lib/auth-providers";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; email?: string }>;
}) {
  const { redirect_url, email } = await searchParams;
  const redirectTo = redirect_url && redirect_url.startsWith("/") ? redirect_url : "/";
  const signUpHref = "/sign-up?redirect_url=" + encodeURIComponent(redirectTo);
  const googleEnabled = isGoogleAuthConfigured();
  const defaultEmail = email?.trim().toLowerCase() ?? "";

  return (
    <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-primary">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><MountainSnow size={21} /></span>
          Ghoomora
        </Link>
        <Card className="p-8">
          <h1 className="display-title text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to plan trips and book journeys.</p>
          <div className="mt-7">
            <SignInForm
              redirectTo={redirectTo}
              signUpHref={signUpHref}
              googleEnabled={googleEnabled}
              defaultEmail={defaultEmail}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
