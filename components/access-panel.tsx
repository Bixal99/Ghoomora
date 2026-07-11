import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authIsConfigured } from "@/lib/auth";

export function AccessPanel() {
  const configured = authIsConfigured();
  return <div className="grid min-h-[70vh] place-items-center"><Card className="max-w-lg p-9 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-muted"><KeyRound /></span><h1 className="display-title mt-5 text-4xl">{configured ? "Partner sign-in required" : "Connect Clerk and Neon"}</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">{configured ? "Sign in with the account synchronized to your Ghoomora profile." : "The public MVP is running in demo mode. Add the environment values from .env.example, run the migration and configure the Clerk webhook to enable protected workflows."}</p><Button asChild className="mt-6"><Link href={configured ? "/sign-in" : "/"}>{configured ? "Sign in" : "Return to public site"}</Link></Button></Card></div>;
}
