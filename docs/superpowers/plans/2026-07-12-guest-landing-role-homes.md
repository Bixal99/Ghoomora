# Guest Landing + Role Homes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guest-only marketing `/` with a quiet readable hero and aligned cards; signed-in users always land on role homes, with a new customer hub at `/home`.

**Architecture:** Extend `getRoleHomePath` and redirect authenticated visitors away from `/`. Simplify guest hero CTAs. Add `app/home/page.tsx` for customers. Pass role-home href into header logos. Keep mountain background; fix contrast and equal-height cards below the fold.

**Tech Stack:** Next.js App Router, existing Auth.js `getActor()`, Tailwind, existing `EmptyState` / `WelcomeToast` / `Card` / `Button`.

## Global Constraints

- Do not redesign vendor `/dashboard` or admin `/approvals` visuals.
- Do not change Auth.js session mechanics beyond redirect path helpers.
- Preserve Part 5 real-data catalog behavior (empty/setup states).
- Keep mountain / dark-green hero background; no purple/glow AI-default look.

---

### Task 1: Role home path + navigation helpers

**Files:**
- Modify: `lib/navigation.ts`
- Create: `tests/navigation-role-home.test.ts`
- Modify: `docs/superpowers/specs/2026-07-12-role-based-ux-design.md` (role-home table only)

**Interfaces:**
- Produces: `getRoleHomePath(role)` returns `/home` for CUSTOMER, `/dashboard` for VENDOR, `/approvals` for ADMIN, `/` for undefined/guest usage sites that need a public fallback separately.

- [ ] **Step 1: Write failing tests**

```ts
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
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- tests/navigation-role-home.test.ts`

- [ ] **Step 3: Implement**

In `lib/navigation.ts`:
- `getRoleHomePath`: `CUSTOMER` → `"/home"` (was `"/"`).
- `getPublicNav` for CUSTOMER: prepend `{ href: "/home", label: "Home" }`.
- `getAccountMenuLinks` for customer: add `{ href: "/home", label: "Home" }` near Profile/Bookings.
- `getLandingCta`: keep guest Get Started → `/sign-up`; role branches can remain for safety but `/` will not call them for signed-in users.

Update Part 3 spec role-home row: CUSTOMER → `/home`.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add lib/navigation.ts tests/navigation-role-home.test.ts docs/superpowers/specs/2026-07-12-role-based-ux-design.md
git commit -m "feat: route customers to /home after login"
```

---

### Task 2: Guest-only `/` redirect + logo role homes

**Files:**
- Modify: `app/page.tsx` (redirect only in this task, or redirect + leave hero for Task 3)
- Modify: `components/site-header.tsx`, `components/inner-header.tsx`, `components/site-header-shell.tsx`, `components/inner-header-shell.tsx`
- Modify: `components/portal-shell.tsx` — “Public site” link may stay `/` (guests) or point to role home when signed in; prefer logo → `getRoleHomePath(role)`, keep “← Public site” as `/` only if it would bounce — for vendors use no public marketing; change “← Public site” to omit or link packages. Spec: logo → role home. Public site link for partners: `/packages` (explore) instead of `/` to avoid redirect loop confusion — use `getRoleHomePath` for logo only; change portal “Public site” to `/packages`.

- [ ] **Step 1: Redirect on `/`**

At top of `app/page.tsx` default export:

```ts
import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/navigation";

const actor = await getActor();
if (actor) redirect(getRoleHomePath(actor.role));
```

- [ ] **Step 2: Header logo href**

Pass `homeHref` from shells:
- Shells: `const homeHref = actor ? getRoleHomePath(actor.role) : "/"`
- `SiteHeader` / `InnerHeader`: `homeHref` prop on logo `Link`

- [ ] **Step 3: Portal logo**

`PortalShell`: logo `Link` → `getRoleHomePath(actor.role)` (need actor.role already available). Replace `← Public site` href `/` with `/packages`.

- [ ] **Step 4: Manual check** — signed-in customer hitting `/` lands on `/home`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: redirect signed-in users away from marketing landing"
```

---

### Task 3: Quiet guest hero + CTA simplification

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/home-hero-cta.tsx` — guest-only Get Started (no role branching needed on this page)

- [ ] **Step 1: Hero markup**

First viewport contents only:
- `SiteHeaderShell`
- `HeroScene` (keep)
- Headline: solid white, e.g. `Go beyond the postcard.` (no `GradientText` italic as primary)
- One supporting paragraph `text-white/80`
- `<HomeHeroCta />` → single Get Started → `/sign-up`
- Remove eyebrow pill, floating “Built for real roads” card, and hero stats strip from first viewport

- [ ] **Step 2: Simplify HomeHeroCta**

```tsx
export function HomeHeroCta() {
  return (
    <div className="mt-9">
      <Button asChild size="lg" variant="accent">
        <Link href="/sign-up">Get Started <ArrowRight size={18} /></Link>
      </Button>
    </div>
  );
}
```

(Can remain async server component or become sync client-free server component.)

- [ ] **Step 3: Contrast pass** — no dark-on-dark chips in hero; accent buttons only.

- [ ] **Step 4: Commit**

```bash
git commit -m "fix: quiet guest hero contrast and CTA"
```

---

### Task 4: Below-fold services + equal-height cards

**Files:**
- Modify: `app/page.tsx`
- Optionally small shared class via Tailwind on card wrappers

- [ ] **Step 1: Services row**

Add a services section with 3–4 equal cards (`grid md:grid-cols-2 lg:grid-cols-4`, each `Card` `h-full` + `flex flex-col`, shared `min-h` if needed): Discover regions, Compare packages, Build a trip, Book verified operators.

- [ ] **Step 2: Region / destination / feature rows**

Ensure region links and destination cards use `h-full` / equal min-height; feature icon cards same. Keep Part 5 empty/setup handling.

- [ ] **Step 3: Visual check** — cards align in a row on desktop.

- [ ] **Step 4: Commit**

```bash
git commit -m "fix: align landing service and region cards"
```

---

### Task 5: Traveler hub `/home`

**Files:**
- Create: `app/home/page.tsx`
- Modify: `components/welcome-toast.tsx` mount sites (add `/home`; can remove from `app/page.tsx` since guests only there)

- [ ] **Step 1: Page skeleton**

```tsx
// app/home/page.tsx
export const dynamic = "force-dynamic";

export default async function TravelerHomePage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?redirect_url=/home");
  if (actor.role === Role.VENDOR) redirect("/dashboard");
  if (actor.role === Role.ADMIN) redirect("/approvals");
  // CUSTOMER continues
  ...
}
```

- [ ] **Step 2: Data**

Load up to 5 bookings for `customerId: actor.id` (same includes as bookings page). Render welcome, list or EmptyState, quick-action equal-height cards (Packages, Trip builder, Bookings, Profile). Mount `<WelcomeToast />`.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add customer traveler home at /home"
```

---

### Task 6: Spec status + verification

**Files:**
- Modify: `docs/superpowers/specs/2026-07-12-guest-landing-role-homes-design.md` status → Implemented

- [ ] **Step 1: Run**

```powershell
npm run typecheck
npm test
npm run build
```

- [ ] **Step 2: Manual**

- Guest `/`: quiet hero, Get Started → sign-up, aligned cards  
- Customer login → `/home`; `/` redirects to `/home`  
- Vendor → `/dashboard`; admin → `/approvals`  
- Logo goes to role home when signed in  

- [ ] **Step 3: Commit**

```bash
git commit -m "docs: mark guest landing role homes design implemented"
```

---

## Self-review

- Spec coverage: routing, guest hero, cards, `/home`, logo — each has a task.
- No TBD placeholders.
- `getRoleHomePath("/home")` consistent across Tasks 1–5.
