import { z } from "zod";
import { getDestination } from "@/lib/data";
import { querySafetyPoints } from "@/lib/overpass";

const requestSchema = z.object({ slug: z.string().trim().min(1) }).strict();

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  try {
    const { slug: destinationSlug } = requestSchema.parse({ slug });
    const destination = await getDestination(destinationSlug);
    if (!destination) return Response.json({ error: "Destination not found." }, { status: 404 });
    const points = await querySafetyPoints(destination.latitude, destination.longitude);
    return Response.json({ destination: destination.name, points, provider: "overpass" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Safety lookup failed." }, { status: 503 });
  }
}
