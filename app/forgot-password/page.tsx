import Link from "next/link";
import { MountainSnow } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
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
          <h1 className="display-title text-4xl">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email for your password-based Ghoomora account. We will send a link to choose a new password.
          </p>
          <div className="mt-7">
            <ForgotPasswordForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
