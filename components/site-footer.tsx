import Link from "next/link";
import { MountainSnow } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#0e2b24] py-14 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><div className="flex items-center gap-2 text-xl font-extrabold"><MountainSnow className="text-accent" /> Ghoomora</div><p className="mt-4 max-w-md text-sm leading-7 text-white/65">One thoughtful place to discover Northern Pakistan, compare trips and plan with local operators.</p></div>
        <div><p className="eyebrow text-accent">Explore</p><div className="mt-4 grid gap-3 text-sm text-white/75"><Link href="/packages">Packages</Link><Link href="/trip-builder">Trip builder</Link><Link href="/regions/gilgit-baltistan">Destinations</Link></div></div>
        <div><p className="eyebrow text-accent">Partners</p><div className="mt-4 grid gap-3 text-sm text-white/75"><Link href="/dashboard">Vendor dashboard</Link><Link href="/approvals">Admin approvals</Link><span>support@ghoomora.pk</span></div></div>
      </div>
      <div className="container-shell mt-12 border-t border-white/10 pt-6 text-xs text-white/45">© 2026 Ghoomora. Sample packages are clearly marked until verified vendors join.</div>
    </footer>
  );
}
