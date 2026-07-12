"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  BusFront,
  CalendarCheck,
  LayoutDashboard,
  MountainSnow,
  Package,
  ShieldCheck,
  TentTree,
  UserRound,
} from "lucide-react";
import { Role, type VendorType } from "@prisma/client";
import type { ReactNode } from "react";
import { getPortalNav, getRoleHomePath } from "@/lib/navigation";

const ICONS = {
  overview: LayoutDashboard,
  fleet: BusFront,
  hotels: BedDouble,
  guide: UserRound,
  camps: TentTree,
  packages: Package,
  bookings: CalendarCheck,
  approvals: ShieldCheck,
  analytics: BarChart3,
} as const;

export function PortalShell({
  children,
  admin = false,
  vendorTypes = [],
}: {
  children: ReactNode;
  admin?: boolean;
  vendorTypes?: VendorType[];
}) {
  const pathname = usePathname();
  const homeHref = getRoleHomePath(admin ? Role.ADMIN : Role.VENDOR);
  const nav = getPortalNav(vendorTypes, admin).map((item) => ({
    ...item,
    icon: ICONS[item.iconKey as keyof typeof ICONS] ?? LayoutDashboard,
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_100%_0%,rgba(240,179,87,.10),transparent_24rem),#eef1eb]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-[linear-gradient(180deg,#12372e,#0c261f)] p-6 text-white shadow-2xl lg:flex">
        <Link href={homeHref} className="flex items-center gap-2 text-xl font-extrabold"><MountainSnow className="text-accent" /> Ghoomora</Link>
        <p className="eyebrow mt-10 text-white/40">{admin ? "Admin" : "Partner"} portal</p>
        <nav className="mt-5 grid gap-1.5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={"flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition " + (active ? "bg-accent text-primary shadow-lg shadow-black/10" : "text-white/70 hover:bg-white/10 hover:text-white")}
              >
                <item.icon size={18} />{item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/packages" className="mt-auto text-sm text-white/55 hover:text-white">← Public site</Link>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 overflow-x-auto bg-[#102e27] px-4 py-3 text-white lg:hidden">
        <Link href={homeHref} className="flex shrink-0 items-center gap-2 font-extrabold"><MountainSnow className="text-accent" size={20} /> Ghoomora</Link>
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

      <main className="lg:pl-64"><div className="mx-auto max-w-6xl p-5 pb-12 md:p-10 md:pb-16">{children}</div></main>
    </div>
  );
}
