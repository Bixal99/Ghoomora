import Link from "next/link";
import { MountainSnow } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[linear-gradient(180deg,#0f3028,#0a241e)] py-14 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><div className="flex items-center gap-3 text-xl font-extrabold"><span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><MountainSnow size={20} /></span> Ghoomora</div><p className="mt-4 max-w-md text-sm leading-7 text-white/65">One thoughtful place to discover Northern Pakistan, compare trips and plan with local operators.</p></div>
        <div><p className="eyebrow text-accent">Explore</p><div className="mt-4 grid gap-3 text-sm text-white/70 [&_a]:transition [&_a]:hover:text-accent"><Link href="/packages">Packages</Link><Link href="/trip-builder">Trip builder</Link><Link href="/regions/gilgit-baltistan">Destinations</Link></div></div>
        <div><p className="eyebrow text-accent">Partners</p><div className="mt-4 grid gap-3 text-sm text-white/70 [&_a]:transition [&_a]:hover:text-accent"><Link href="/dashboard">Vendor dashboard</Link><Link href="/approvals">Admin approvals</Link><span>support@ghoomora.pk</span></div></div>
      </div>
      <div className="container-shell mt-12 border-t border-white/10 pt-6 text-xs text-white/50">© 2026 Ghoomora. Sample packages are clearly marked until verified vendors join.</div>
    </footer>
  );
}
