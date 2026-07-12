import Link from "next/link";
import { ArrowUpRight, Mountain, Route } from "lucide-react";
import type { DestinationView } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const tones = ["from-[#1b4c3f] to-[#5e8d80]", "from-[#253d57] to-[#7599aa]", "from-[#5b402c] to-[#c38e54]"];

export function DestinationCard({ destination, index = 0 }: { destination: DestinationView; index?: number }) {
  return (
    <Card className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(16,40,32,.13)]">
      <div className={"relative h-52 overflow-hidden bg-gradient-to-br " + tones[index % tones.length]}>
        <div className="absolute inset-0 opacity-30 transition duration-500 [background-image:radial-gradient(circle_at_25%_20%,white_0,transparent_35%)] group-hover:scale-110" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[#10251f]/30 [clip-path:polygon(0_75%,18%_32%,35%_68%,51%_20%,70%_72%,84%_37%,100%_65%,100%_100%,0_100%)]" />
        <div className="absolute left-5 top-5 flex gap-2"><Badge>{destination.region.name}</Badge>{destination.requiresLocalTransport && <Badge className="border-accent bg-accent text-primary"><Route size={12} /> 4x4</Badge>}</div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-extrabold">{destination.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Mountain size={15} /> {destination.elevationMeters.toLocaleString()}m · {destination.difficulty}</p></div><Link className="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-primary/15 bg-white transition group-hover:bg-primary group-hover:text-white" href={"/destinations/" + destination.slug} aria-label={"View " + destination.name}><ArrowUpRight size={18} /></Link></div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{destination.description}</p>
      </div>
    </Card>
  );
}
