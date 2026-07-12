import { describe, expect, it } from "vitest";
import { resolvePgConnectionString } from "../lib/pg-connection";

describe("resolvePgConnectionString", () => {
  it("upgrades sslmode=require to verify-full on remote hosts", () => {
    expect(resolvePgConnectionString("postgresql://u:p@h/db?sslmode=require")).toBe(
      "postgresql://u:p@h/db?sslmode=verify-full",
    );
  });

  it("preserves unrelated query params on remote hosts", () => {
    const resolved = resolvePgConnectionString(
      "postgresql://u:p@h/db?channel_binding=require&sslmode=require",
    );
    expect(resolved).toContain("sslmode=verify-full");
    expect(resolved).toContain("channel_binding=require");
  });

  it("does not rewrite sslmode for localhost", () => {
    expect(resolvePgConnectionString("postgresql://u:p@localhost:5432/ghoomora?sslmode=require")).toBe(
      "postgresql://u:p@localhost:5432/ghoomora?sslmode=require",
    );
  });

  it("leaves localhost URLs without sslmode unchanged", () => {
    expect(resolvePgConnectionString("postgresql://u:p@localhost:5432/ghoomora")).toBe(
      "postgresql://u:p@localhost:5432/ghoomora",
    );
  });

  it("does not rewrite sslmode for 127.0.0.1", () => {
    expect(resolvePgConnectionString("postgresql://u:p@127.0.0.1:5432/ghoomora?sslmode=prefer")).toBe(
      "postgresql://u:p@127.0.0.1:5432/ghoomora?sslmode=prefer",
    );
  });
});
