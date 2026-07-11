import { z } from "zod";
import { estimateCustomTripCost, suggestItinerary } from "@/lib/ai";

const plannerSchema = z.object({
  budget: z.coerce.number().int().positive(),
  days: z.coerce.number().int().min(2).max(21),
  interests: z.string().trim().min(3),
  regionSlug: z.string().optional(),
});

const estimatorSchema = z.object({
  days: z.coerce.number().int().min(2).max(21),
  travelers: z.coerce.number().int().min(1).max(30),
  tier: z.enum(["STANDARD", "MODERATE", "LUXURY"]),
  regionSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const mode = typeof body.mode === "string" ? body.mode : "planner";
  try {
    if (mode === "estimator") {
      const parsed = estimatorSchema.parse(body);
      return Response.json(await estimateCustomTripCost(parsed));
    }
    const parsed = plannerSchema.parse(body);
    return Response.json({ stops: await suggestItinerary(parsed) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 400 });
  }
}
