import "server-only";
import Groq from "groq-sdk";
import { getRegions } from "@/lib/data";

function client() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

export async function suggestItinerary(input: { budget: number; days: number; interests: string; regionSlug?: string }) {
  const regions = await getRegions();
  const destinations = regions
    .filter((region) => !input.regionSlug || region.slug === input.regionSlug)
    .flatMap((region) => region.destinations.map((destination) => ({ name: destination.name, slug: destination.slug, region: region.name, difficulty: destination.difficulty, requiresLocalTransport: destination.requiresLocalTransport })));
  const groq = client();
  if (!groq) {
    return destinations.slice(0, Math.min(input.days, destinations.length)).map((destination, index) => ({
      dayNumber: index + 1,
      destinationSlug: destination.slug,
      destinationName: destination.name,
      stopType: index === 0 ? "overnight" : "viewpoint",
      note: "Demo suggestion — set GROQ_API_KEY for AI-assisted planning.",
    }));
  }
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You plan Northern Pakistan trips using ONLY destinations from the provided list. Return JSON array of {dayNumber, destinationSlug, stopType, note}. Never invent places." },
      { role: "user", content: JSON.stringify({ budget: input.budget, days: input.days, interests: input.interests, destinations }) },
    ],
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { stops?: Array<{ dayNumber: number; destinationSlug: string; stopType: string; note?: string }> };
  const allowed = new Set(destinations.map((item) => item.slug));
  return (parsed.stops ?? []).filter((stop) => allowed.has(stop.destinationSlug)).map((stop) => ({
    ...stop,
    destinationName: destinations.find((item) => item.slug === stop.destinationSlug)?.name ?? stop.destinationSlug,
  }));
}

export async function estimateCustomTripCost(input: { days: number; travelers: number; regionSlug?: string; tier: string }) {
  const basePerPerson = input.tier === "LUXURY" ? 28500 : input.tier === "MODERATE" ? 16500 : 9500;
  const pickup = input.tier === "STANDARD" ? 25000 : 90000;
  const food = 4500 * input.days * input.travelers;
  const fuel = 12000 * input.days;
  return {
    lodgingAndTier: basePerPerson * input.days * input.travelers,
    pickupTransport: pickup,
    foodEstimate: food,
    fuelEstimate: fuel,
    total: basePerPerson * input.days * input.travelers + pickup + food + fuel,
    disclaimer: "AI-assisted estimate for planning only. Confirm with verified operators.",
  };
}
