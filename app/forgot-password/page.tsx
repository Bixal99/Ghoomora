import Link from "next/link";
import { MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#e5eee9] p-6">
      <Card className="max-w-md p-9 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted"><MailQuestion /></span>
        <h1 className="display-title mt-5 text-3xl">Password reset coming soon</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Email-based password recovery is not enabled yet. For now, please contact support or sign in with your existing
          credentials.
        </p>
        <Button asChild className="mt-6">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </Card>
    </main>
  );
}
