import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() { return <main className="grid min-h-screen place-items-center bg-[#13382f] p-6 text-white"><div className="text-center"><p className="eyebrow text-accent">404 · off route</p><h1 className="display-title mt-3 text-7xl">This trail is not mapped.</h1><Button asChild variant="accent" className="mt-7"><Link href="/">Return to Ghoomora</Link></Button></div></main>; }
