import Pusher from "pusher";

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? "ap2";
  if (!appId || !key || !secret) return null;
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

export async function publishBookingLocation(bookingId: string, latitude: number, longitude: number) {
  const pusher = getPusherServer();
  if (!pusher) return false;
  await pusher.trigger("booking-" + bookingId, "location", { latitude, longitude, updatedAt: new Date().toISOString() });
  return true;
}
