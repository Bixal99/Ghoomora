# Landing Hero + Regions Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the guest landing hero with a smaller partial golden typewriter, fill the regions header gap with an animated route ribbon, and upgrade region cards with partial photos and hover motion.

**Architecture:** Keep `app/page.tsx` as a server page. Extract client pieces (`HeroTypewriter`, `RouteRibbon`, `RegionCard`) and a pure slug→image helper for tests. Reuse existing GSAP patterns from `loading-screen.tsx` for path draw; Framer Motion already powers `Reveal`.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4, GSAP, Framer Motion (`useReducedMotion`), Next/Image, Vitest.

## Global Constraints

- Guest landing `/` only — do not change traveler `/home` cards.
- Static `public/` assets mapped by slug — no new DB image fields.
- Preserve catalog setup/empty states.
- Respect `prefers-reduced-motion`.
- Keep mountain dark-green hero; accent gold `#f0b357` / `text-accent`.

---

### Task 1: Region image map helper

**Files:**
- Create: `lib/region-images.ts`
- Create: `tests/region-images.test.ts`

**Interfaces:**
- Produces: `getRegionImage(slug: string): string | null`
- Produces: `REGION_IMAGES` record for known slugs

- [ ] **Step 1: Write failing test**

```ts
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
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- tests/region-images.test.ts`

- [ ] **Step 3: Implement helper**

```ts
export const REGION_IMAGES: Record<string, string> = {
  "gilgit-baltistan": "/gilgit.png",
  "kpk-northern-areas": "/kpk.png",
  "azad-jammu-kashmir": "/Azad_kashmir.jpg",
};

export function getRegionImage(slug: string): string | null {
  return REGION_IMAGES[slug] ?? null;
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- tests/region-images.test.ts`

---

### Task 2: Hero typewriter

**Files:**
- Create: `components/hero-typewriter.tsx`
- Modify: `app/page.tsx` (hero `h1`)

**Interfaces:**
- Produces: `<HeroTypewriter />` — static `Go beyond the ` + typed `postcard.` in accent gold
- Consumes: `useReducedMotion` from framer-motion

- [ ] **Step 1: Create `HeroTypewriter`**

Client component:
- Smaller display class: `display-title text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[.88] text-white`
- Static span: `Go beyond the `
- Typed span with `text-accent`: characters of `postcard.` revealed one by one (~55–70ms)
- Blinking caret (`|` or thin bar) while typing; hide when done
- If reduced motion: render full string immediately, typed part still `text-accent`

- [ ] **Step 2: Wire into `app/page.tsx`**

Replace the hero `h1` text with `<HeroTypewriter />`.

- [ ] **Step 3: Visual check**

Open `/` logged out — confirm smaller title, white prefix, golden typed suffix.

---

### Task 3: Route ribbon for regions header gap

**Files:**
- Create: `components/route-ribbon.tsx`
- Modify: `app/page.tsx` (regions section header)

**Interfaces:**
- Produces: `<RouteRibbon className?: string />` decorative SVG, `aria-hidden`

- [ ] **Step 1: Create `RouteRibbon`**

- SVG path similar spirit to loading-screen route (horizontal trail across ~180–220 viewBox width)
- GSAP: stroke draw on mount when not reduced motion; small circle pin travels along path once
- Reduced motion: path fully visible, pin at end
- Colors: path `#5a7f73`, accent pin/dot `#f0b357`
- Height ~64–80px so it fills the mid-column without towering over type

- [ ] **Step 2: Update regions header layout**

Change Reveal wrapper to:

```tsx
<Reveal className="grid gap-8 lg:grid-cols-[1fr_minmax(10rem,16rem)_1fr] lg:items-center">
  <div>…eyebrow + h2…</div>
  <RouteRibbon className="mx-auto hidden w-full max-w-xs lg:block" />
  <p className="… lg:justify-self-end">…</p>
  <RouteRibbon className="mt-2 w-40 lg:hidden" />
</Reveal>
```

(Or place mobile ribbon inside the title column under the h2.)

- [ ] **Step 3: Visual check**

Desktop: gap between title and blurb filled. Mobile: small strip under title.

---

### Task 4: Photo-backed region cards

**Files:**
- Create: `components/region-card.tsx`
- Modify: `app/page.tsx` (region grid map)

**Interfaces:**
- Consumes: `getRegionImage(slug)`, region `{ slug, name, blurb, destinations }`
- Produces: `<RegionCard region={…} index={number} />`

- [ ] **Step 1: Create `RegionCard`**

- Link to `/regions/{slug}` with `cursor-pointer`, existing focus-ring, rounded-[2rem]
- If image: top ~55% `next/image` fill, `object-cover`, group-hover scale 1.05
- Gradient overlay from transparent → brand panel color into lower content area
- Brand colors: index 0 primary green, 1 `#294b61`, 2 `#755136` (match current)
- Lower content: destinations count, name, blurb, “Explore region” CTA in accent
- Hover: `-translate-y-1.5`, stronger shadow; optional short dashed SVG line near CTA
- No image: keep solid color treatment like today

- [ ] **Step 2: Replace inline region Link in `app/page.tsx` with `<RegionCard />`**

- [ ] **Step 3: Visual check**

Confirm three photos map correctly, text readable, hover feels good.

---

### Task 5: Verify

- [ ] **Step 1:** `npm test -- tests/region-images.test.ts`
- [ ] **Step 2:** `npm run typecheck` (or project equivalent)
- [ ] **Step 3:** Manual pass on `/` — hero typewriter, route ribbon, region cards, reduced-motion sanity if easy

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Smaller hero + partial golden typewriter | 2 |
| Route ribbon in header gap | 3 |
| Partial photos on region cards | 4 |
| Hover + pointer cursor | 4 |
| Reduced motion | 2, 3, 4 |
| Slug image map | 1 |
| Landing only | all |
