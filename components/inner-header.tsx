"use client";

import Link from "next/link";
import { Compass, MountainSnow } from "lucide-react";
import type { NavLink } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { UserAccountMenu } from "@/components/user-account-menu";

export function InnerHeader({
  navLinks,
  exploreHref = "/packages",
  accountMenuLinks,
  homeHref = "/",
}: {
  navLinks: NavLink[];
  exploreHref?: string | null;
  accountMenuLinks?: NavLink[];
  homeHref?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[#f8f5ed]/88 shadow-[0_8px_30px_rgba(16,40,32,.05)] backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href={homeHref} className="focus-ring flex items-center gap-2 rounded-lg font-extrabold">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-accent"><MountainSnow size={19} /></span>
          Ghoomora
        </Link>
        <nav className="hidden gap-6 text-sm font-bold lg:flex [&_a]:transition [&_a]:hover:text-[#2f7b68]">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {exploreHref && (
            <Button asChild size="sm">
              <Link href={exploreHref}><Compass size={16} /> Explore</Link>
            </Button>
          )}
          <UserAccountMenu variant="light" menuLinks={accountMenuLinks} />
        </div>
      </div>
    </header>
  );
}
