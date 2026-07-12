/**
 * Normalize Postgres connection strings for node-postgres.
 * Local hosts skip SSL rewriting (local Postgres usually has no TLS).
 * Remote hosts upgrade legacy sslmode values to verify-full (Neon-compatible).
 */
export function resolvePgConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return url.toString();
    }
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}
