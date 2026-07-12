import { describe, expect, it } from "vitest";
import { getRegionImage } from "../lib/region-images";

describe("getRegionImage", () => {
  it("maps known region slugs to public assets", () => {
    expect(getRegionImage("gilgit-baltistan")).toBe("/gilgit.png");
    expect(getRegionImage("kpk-northern-areas")).toBe("/kpk.png");
    expect(getRegionImage("azad-jammu-kashmir")).toBe("/Azad_kashmir.jpg");
  });

  it("returns null for unknown slugs", () => {
    expect(getRegionImage("unknown-region")).toBeNull();
  });
});
