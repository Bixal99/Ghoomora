import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { getRoleHomePath, resolvePostLoginRedirect, getPublicNav } from "../lib/navigation";

describe("getRoleHomePath", () => {
  it("sends customers to /home", () => {
    expect(getRoleHomePath(Role.CUSTOMER)).toBe("/home");
  });
  it("keeps vendor and admin homes", () => {
    expect(getRoleHomePath(Role.VENDOR)).toBe("/dashboard");
    expect(getRoleHomePath(Role.ADMIN)).toBe("/approvals");
  });
});

describe("resolvePostLoginRedirect", () => {
  it("maps bare / to customer home", () => {
    expect(resolvePostLoginRedirect("/", Role.CUSTOMER)).toBe("/home");
  });
});

describe("getPublicNav customer", () => {
  it("includes Home first", () => {
    const actor = {
      id: "u1",
      role: Role.CUSTOMER,
      vendorApplications: [],
      vendor: null,
    } as any;
    expect(getPublicNav(actor)[0]).toEqual({ href: "/home", label: "Home" });
  });
});
