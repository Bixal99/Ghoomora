import { unstable_cache } from "next/cache";
import { z } from "zod";
import { getPackage } from "@/lib/data";
import { requestOrsRoute, RouteServiceError, validateRoutePackage } from "@/lib/ors";
import type { RouteErrorBody } from "@/lib/route-types";

const requestSchema = z.object({ packageId: z.string().trim().min(1).max(100) }).strict();

const cachedRoute = unstable_cache(async (packageId: string) => {
  const pkg = validateRoutePackage(await getPackage(packageId));
  return requestOrsRoute(pkg);
}, ["ors-package-route-v1"], { revalidate: 21_600 });

export async function POST(request: Request) {
  let body: z.infer<typeof requestSchema>;
  try { body = requestSchema.parse(await request.json()); }
  catch {
    const error: RouteErrorBody = { code: "INVALID_REQUEST", message: "A valid packageId is required.", retryable: false };
    return Response.json(error, { status: 400 });
  }
  try { return Response.json(await cachedRoute(body.packageId)); }
  catch (error) {
    if (error instanceof RouteServiceError) return Response.json(error.body, { status: error.status });
    console.error(JSON.stringify({ scope: "route-api", packageId: body.packageId, message: error instanceof Error ? error.message : "Unknown route failure" }));
    const fallback: RouteErrorBody = { code: "SERVICE_UNAVAILABLE", message: "Route visualization is temporarily unavailable.", retryable: true };
    return Response.json(fallback, { status: 503 });
  }
}
