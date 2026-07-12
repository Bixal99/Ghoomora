import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card } from "@/components/ui/card";
import { isGoogleAuthConfigured } from "@/lib/auth-providers";

export const metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
  const { redirect_url } = await searchParams;
  const redirectTo = redirect_url && redirect_url.startsWith("/") ? redirect_url : "/";
  const signInHref = "/sign-in?redirect_url=" + encodeURIComponent(redirectTo);
  const googleEnabled = isGoogleAuthConfigured();

  return (
    <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-primary">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><MountainSnow size={21} /></span>
          Ghoomora
        </Link>
        <Card className="p-8">
          <h1 className="display-title text-4xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join Ghoomora to book journeys across Northern Pakistan.</p>
          <div className="mt-7">
            <SignUpForm redirectTo={redirectTo} signInHref={signInHref} googleEnabled={googleEnabled} />
          </div>
        </Card>
      </div>
    </main>
  );
}
