import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const db = getDb();
  if (!db) return Response.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const event = await verifyWebhook(request);
    if (event.type === "user.created" || event.type === "user.updated") {
      const email = event.data.email_addresses.find((item) => item.id === event.data.primary_email_address_id)?.email_address ?? event.data.email_addresses[0]?.email_address;
      if (!email) return Response.json({ error: "User email is required." }, { status: 422 });
      const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
      const role = admins.includes(email.toLowerCase()) ? Role.ADMIN : undefined;
      await db.user.upsert({ where: { clerkId: event.data.id }, update: { email, name: [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || email, ...(role ? { role } : {}) }, create: { clerkId: event.data.id, email, name: [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || email, role: role ?? Role.CUSTOMER } });
    }
    if (event.type === "user.deleted" && event.data.id) await db.user.deleteMany({ where: { clerkId: event.data.id } });
    return Response.json({ received: true });
  } catch (error) {
    console.error(JSON.stringify({ scope: "clerk-webhook", message: error instanceof Error ? error.message : "Unknown webhook error" }));
    return Response.json({ error: "Webhook verification failed." }, { status: 400 });
  }
}
