"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Compass, LogOut, Menu, MountainSnow, UserRound } from "lucide-react";
import type { NavLink } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { UserAccountMenu } from "@/components/user-account-menu";

export function SiteHeader({
  navLinks,
  exploreHref = "/packages",
  accountMenuLinks,
}: {
  navLinks: NavLink[];
  exploreHref?: string | null;
  accountMenuLinks?: NavLink[];
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 py-4 text-white">
      <div className="container-shell flex h-16 items-center justify-between rounded-full border border-white/15 bg-[#0b261f]/55 px-4 shadow-[0_16px_50px_rgba(4,18,14,.24)] backdrop-blur-xl md:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-extrabold tracking-tight" aria-label="Ghoomora home">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><MountainSnow size={21} /></span>
          <span className="text-xl">Ghoomora</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex [&_a]:transition [&_a]:hover:text-accent" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {exploreHref && (
            <Button asChild variant="accent">
              <Link href={exploreHref}><Compass size={17} /> Explore trips</Link>
            </Button>
          )}
          <UserAccountMenu variant="hero" menuLinks={accountMenuLinks} />
        </div>
        <details className="relative lg:hidden">
          <summary className="focus-ring grid size-11 list-none place-items-center rounded-full border border-white/25 bg-white/5 transition hover:bg-white/10" aria-label="Open navigation"><Menu /></summary>
          <nav className="absolute right-0 mt-3 grid w-64 gap-1 rounded-2xl border border-primary/10 bg-[#fffdf8] p-3 text-primary shadow-2xl" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link key={link.href} className="rounded-xl p-3 hover:bg-muted" href={link.href}>{link.label}</Link>
            ))}
            <div className="mt-1 flex flex-col gap-2 border-t border-primary/10 pt-2">
              <UserAccountMenu variant="hero" menuLinks={accountMenuLinks} mobile />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
