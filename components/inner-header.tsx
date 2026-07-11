import Link from "next/link";
import { Compass, MountainSnow } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InnerHeader() {
  return (
    <header className="border-b bg-[#f8f5ed]/90 backdrop-blur">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-extrabold"><span className="grid size-9 place-items-center rounded-full bg-primary text-accent"><MountainSnow size={19} /></span>Ghoomora</Link>
        <nav className="hidden gap-6 text-sm font-bold md:flex"><Link href="/regions/gilgit-baltistan">Regions</Link><Link href="/packages">Packages</Link><Link href="/trip-builder">Trip builder</Link><Link href="/dashboard">Vendors</Link></nav>
        <Button asChild size="sm"><Link href="/packages"><Compass size={16} /> Explore</Link></Button>
      </div>
    </header>
  );
}
