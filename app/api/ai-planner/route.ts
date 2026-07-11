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

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const field = issue.path[0];
      if (field === "days" && issue.code === "too_small") return "Days must be at least 2.";
      if (field === "days" && issue.code === "too_big") return "Days cannot exceed 21.";
      if (field === "budget") return "Budget must be a positive number.";
      if (field === "interests") return "Interests must be at least 3 characters.";
      return issue.message;
    })
    .join(" ");
}

export async function POST(request: Request) {
  const body = await request.json();
  const mode = typeof body.mode === "string" ? body.mode : "planner";

  if (mode === "estimator") {
    const parsed = estimatorSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    try {
      return Response.json(await estimateCustomTripCost(parsed.data));
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 400 });
    }
  }

  const parsed = plannerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }
  try {
    return Response.json({ stops: await suggestItinerary(parsed.data) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 400 });
  }
}
