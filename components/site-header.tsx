import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Compass, Menu, MountainSnow } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 text-white">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-extrabold tracking-tight" aria-label="Ghoomora home">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><MountainSnow size={21} /></span>
          <span className="text-xl">Ghoomora</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label="Primary navigation">
          <Link href="/regions/gilgit-baltistan">Regions</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/trip-builder">Trip builder</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/dashboard">For vendors</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {clerkEnabled ? (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal"><Button type="button" variant="ghost" className="text-white hover:bg-white/10">Sign in</Button></SignInButton>
                <SignUpButton mode="modal"><Button type="button" variant="accent">Sign up</Button></SignUpButton>
              </Show>
              <Show when="signed-in"><UserButton /></Show>
            </>
          ) : null}
          <Button asChild variant="accent"><Link href="/packages"><Compass size={17} /> Explore trips</Link></Button>
        </div>
        <details className="relative md:hidden">
          <summary className="focus-ring grid size-11 list-none place-items-center rounded-full border border-white/30" aria-label="Open navigation"><Menu /></summary>
          <nav className="absolute right-0 mt-3 grid w-56 gap-1 rounded-2xl bg-[#f8f5ed] p-3 text-primary shadow-2xl" aria-label="Mobile navigation">
            <Link className="rounded-xl p-3 hover:bg-muted" href="/regions/gilgit-baltistan">Regions</Link>
            <Link className="rounded-xl p-3 hover:bg-muted" href="/packages">Packages</Link>
            <Link className="rounded-xl p-3 hover:bg-muted" href="/trip-builder">Trip builder</Link>
            <Link className="rounded-xl p-3 hover:bg-muted" href="/profile">Profile</Link>
            <Link className="rounded-xl p-3 hover:bg-muted" href="/dashboard">For vendors</Link>
            {clerkEnabled ? (
              <div className="mt-1 flex items-center gap-2 border-t border-primary/10 pt-2">
                <Show when="signed-out">
                  <SignInButton mode="modal"><Button type="button" size="sm" variant="outline" className="flex-1">Sign in</Button></SignInButton>
                  <SignUpButton mode="modal"><Button type="button" size="sm" variant="accent" className="flex-1">Sign up</Button></SignUpButton>
                </Show>
                <Show when="signed-in"><UserButton /></Show>
              </div>
            ) : null}
          </nav>
        </details>
      </div>
    </header>
  );
}
