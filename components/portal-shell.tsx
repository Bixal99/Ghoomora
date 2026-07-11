import Link from "next/link";
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
  const nav = admin ? [{ href: "/approvals", label: "Approvals", icon: ShieldCheck }] : links;
  return <div className="min-h-screen bg-[#edf0ea]"><aside className="fixed inset-y-0 left-0 hidden w-64 bg-[#102e27] p-6 text-white lg:block"><Link href="/" className="flex items-center gap-2 text-xl font-extrabold"><MountainSnow className="text-accent" /> Ghoomora</Link><p className="eyebrow mt-10 text-white/40">{admin ? "Admin" : "Partner"} portal</p><nav className="mt-5 grid gap-2">{nav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"><item.icon size={18} />{item.label}</Link>)}</nav><Link href="/" className="absolute bottom-7 left-7 text-sm text-white/55">← Public site</Link></aside><main className="lg:pl-64"><div className="mx-auto max-w-6xl p-5 md:p-10">{children}</div></main></div>;
}
