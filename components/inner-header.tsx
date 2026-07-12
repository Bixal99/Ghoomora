"use client";

import Link from "next/link";
import { Compass, MountainSnow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAccountMenu } from "@/components/user-account-menu";

export function InnerHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[#f8f5ed]/88 shadow-[0_8px_30px_rgba(16,40,32,.05)] backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-extrabold"><span className="grid size-9 place-items-center rounded-full bg-primary text-accent"><MountainSnow size={19} /></span>Ghoomora</Link>
        <nav className="hidden gap-6 text-sm font-bold lg:flex [&_a]:transition [&_a]:hover:text-[#2f7b68]"><Link href="/regions/gilgit-baltistan">Regions</Link><Link href="/packages">Packages</Link><Link href="/trip-builder">Trip builder</Link><Link href="/dashboard">Vendors</Link></nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm"><Link href="/packages"><Compass size={16} /> Explore</Link></Button>
          <UserAccountMenu variant="light" />
        </div>
      </div>
    </header>
  );
}
