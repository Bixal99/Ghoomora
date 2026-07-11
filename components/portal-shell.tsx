"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, BusFront, LayoutDashboard, MountainSnow, Package, ShieldCheck, TentTree, UserRound } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/fleet", label: "Fleet & fares", icon: BusFront },
  { href: "/hotels", label: "Hotels", icon: BedDouble },
  { href: "/guide-profile", label: "Guide profile", icon: UserRound },
  { href: "/camps", label: "Camps", icon: TentTree },
  { href: "/vendor/packages", label: "Packages", icon: Package },
];

export function PortalShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const pathname = usePathname();
  const nav = admin ? [{ href: "/approvals", label: "Approvals", icon: ShieldCheck }] : links;

  return (
    <div className="min-h-screen bg-[#edf0ea]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#102e27] p-6 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold"><MountainSnow className="text-accent" /> Ghoomora</Link>
        <p className="eyebrow mt-10 text-white/40">{admin ? "Admin" : "Partner"} portal</p>
        <nav className="mt-5 grid gap-1.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition " + (active ? "bg-accent text-primary" : "text-white/70 hover:bg-white/10 hover:text-white")}
              >
                <item.icon size={18} />{item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="mt-auto text-sm text-white/55 hover:text-white">← Public site</Link>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 overflow-x-auto bg-[#102e27] px-4 py-3 text-white lg:hidden">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-extrabold"><MountainSnow className="text-accent" size={20} /> Ghoomora</Link>
        <nav className="flex gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={"grid size-10 shrink-0 place-items-center rounded-lg transition " + (active ? "bg-accent text-primary" : "text-white/70 hover:bg-white/10")}
              >
                <item.icon size={18} />
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="lg:pl-64"><div className="mx-auto max-w-6xl p-5 md:p-10">{children}</div></main>
    </div>
  );
}
