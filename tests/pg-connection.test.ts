import { describe, expect, it } from "vitest";
import { resolvePgConnectionString } from "../lib/pg-connection";

describe("resolvePgConnectionString", () => {
  it("upgrades sslmode=require to verify-full", () => {
    expect(resolvePgConnectionString("postgresql://u:p@h/db?sslmode=require")).toBe("postgresql://u:p@h/db?sslmode=verify-full");
  });

  it("preserves unrelated query params", () => {
    const resolved = resolvePgConnectionString("postgresql://u:p@h/db?channel_binding=require&sslmode=require");
    expect(resolved).toContain("sslmode=verify-full");
    expect(resolved).toContain("channel_binding=require");
  });
});
