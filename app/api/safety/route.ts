import { z } from "zod";
import { getDestination } from "@/lib/data";
import { querySafetyPoints } from "@/lib/overpass";

const requestSchema = z.object({ slug: z.string().trim().min(1) }).strict();

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  let destinationSlug: string;
  try {
    destinationSlug = requestSchema.parse({ slug }).slug;
  } catch {
    return Response.json({ error: "A valid destination slug is required." }, { status: 400 });
  }

  const destination = await getDestination(destinationSlug);
  if (!destination) return Response.json({ error: "Destination not found." }, { status: 404 });

  const result = await querySafetyPoints(destination.latitude, destination.longitude);
  if (!result) {
    return Response.json({
      destination: destination.name,
      points: [],
      provider: "overpass",
      degraded: true,
      message: "Safety lookup temporarily unavailable.",
    });
  }

  return Response.json({
    destination: destination.name,
    points: result.points,
    provider: "overpass",
    mirror: result.mirror,
    degraded: false,
  });
}
