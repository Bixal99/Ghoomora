/**
 * pg v8 treats sslmode=require as verify-full today but warns about v9.
 * Neon works with verify-full; normalize legacy require URLs once at connect time.
 */
export function resolvePgConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}
