import { redirect } from "next/navigation";
import { InnerHeader } from "@/components/inner-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActor } from "@/lib/auth";

export const dynamic = "force-dynamic";

const levelCopy: Record<string, string> = {
  EXPLORER: "Explorer — just getting started in the mountains.",
  MOUNTAIN_GOAT: "Mountain Goat — seasoned across multiple completed journeys.",
  LEGEND: "Legend — a true Northern Pakistan regular.",
};

export default async function ProfilePage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in");
  return (
    <>
      <InnerHeader />
      <main className="section-pad min-h-screen bg-[#e5eee9]">
        <div className="container-shell max-w-3xl">
          <p className="eyebrow text-[#5a7f73]">Traveler profile</p>
          <h1 className="display-title mt-2 text-6xl">{actor.name}</h1>
          <Card className="mt-8 p-7">
            <Badge>{actor.travelerLevel.replace("_", " ")}</Badge>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{levelCopy[actor.travelerLevel] ?? levelCopy.EXPLORER}</p>
            <p className="mt-4 text-2xl font-extrabold">{actor.completedTripsCount} completed trip{actor.completedTripsCount === 1 ? "" : "s"}</p>
            {actor.badges.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{actor.badges.map((badge) => <Badge key={badge}>{badge.replace(/-/g, " ")}</Badge>)}</div>}
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
