import Link from "next/link";
import { KeyRound, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authIsConfigured } from "@/lib/auth";

export function AccessPanel({ redirectTo = "/dashboard", needsOnboarding = false }: { redirectTo?: string; needsOnboarding?: boolean }) {
  const configured = authIsConfigured();

  if (configured && needsOnboarding) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Card className="max-w-lg p-9 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted"><Store /></span>
          <h1 className="display-title mt-5 text-4xl">Become a vendor first</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">This workspace is for approved vendors. Apply from your profile — once an admin approves your application you can manage fleet, hotels, guides, camps and packages.</p>
          <Button asChild className="mt-6"><Link href="/profile">Apply on your profile</Link></Button>
        </Card>
      </div>
    );
  }

  const signInHref = "/sign-in?redirect_url=" + encodeURIComponent(redirectTo);
  const signUpHref = "/sign-up?redirect_url=" + encodeURIComponent(redirectTo);

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <Card className="max-w-lg p-9 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted"><KeyRound /></span>
        <h1 className="display-title mt-5 text-4xl">{configured ? "Sign-in required" : "Connect your database"}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{configured ? "Sign in or create an account to continue. Vendor access is granted after an admin approves your application." : "The public MVP is running in demo mode. Add the environment values from .env.example, run the migration and seed to enable protected workflows."}</p>
        {configured ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><Link href={signInHref}>Sign in</Link></Button>
            <Button asChild variant="outline"><Link href={signUpHref}>Create account</Link></Button>
          </div>
        ) : (
          <Button asChild className="mt-6"><Link href="/">Return to public site</Link></Button>
        )}
      </Card>
    </div>
  );
}
