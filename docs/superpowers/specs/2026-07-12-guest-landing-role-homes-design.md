# Guest Landing + Role Homes Redesign

**Date:** 2026-07-12  
**Status:** Approved design (awaiting implementation plan)

## Objective

Make `/` a clear guest marketing landing (readable hero, aligned cards). After sign-in, every role lands on their own hub — not the marketing page. Customers get a new traveler home at `/home`.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Customer hub | New `/home` (not `/bookings` alone) |
| Signed-in visit to `/` | Always redirect to role home (marketing is guests only) |
| Hero redesign | Quiet first viewport; keep mountain background; drop vibe-heavy type/chrome |
| Scope | Approach 2 — routing + guest landing polish + `/home`; no vendor/admin portal visual rebuild |

## Routing

| Role | Role home |
|------|-----------|
| Guest | `/` (marketing) |
| CUSTOMER | `/home` |
| VENDOR | `/dashboard` |
| ADMIN | `/approvals` |

### Behavior

- Update `getRoleHomePath` in `lib/navigation.ts`: CUSTOMER → `/home`.
- `app/page.tsx`: if `getActor()` present → `redirect(getRoleHomePath(role))` before any marketing UI.
- Sign-in / sign-up already use `resolvePostLoginRedirect`; when `redirect_url` is `/`, customers go to `/home`.
- Logo / home affordances for signed-in users point to role home.
- Guests may still browse `/packages`, `/regions/[slug]`, `/trip-builder` without auth.
- Guest primary CTA **Get Started** → `/sign-up`. Header keeps Sign in / Sign up.

### `/home` access

- CUSTOMER only.
- Guest → `/sign-in?redirect_url=/home`.
- VENDOR / ADMIN → redirect to their role home.

Updates Part 3 role-home table (customer was `/`).

## Guest landing (`/`)

### First viewport

Keep existing mountain / dark-green hero scene. One composition:

- Brand in header
- One solid high-contrast white headline (no gradient-italic as the main signal)
- One short supporting sentence (explore places + plan with local operators)
- One primary CTA: Get Started → `/sign-up`
- Remove low-contrast eyebrow pill and floating “Built for real roads” callout from the first viewport
- Move or drop the hero stats strip if it clutters the first screen

### Contrast

- On dark hero: light text only (`text-white` / `text-white/80`)
- No dark text on muted yellow chips over the hero
- Accent amber CTAs remain; focus rings visible on dark

### Below the fold

1. Services — what Ghoomora provides, equal-height card row
2. Explore places — region cards equal height / aligned; omit empty blurbs
3. Featured destinations / partner strip — same equal-card discipline

`HomeHeroCta` on `/` is guest-only Get Started; role-specific CTAs live on each role home.

## Traveler hub `/home`

- Layout: inner header + light background (bookings family), not marketing hero
- Welcome back, {name}
- Recent/upcoming bookings (≈5), link to `/bookings/[id]`; empty → EmptyState + trip builder CTA
- Equal-height quick-action cards: Packages, Trip builder, All bookings, Profile
- Customer nav: include Home → `/home`; logo → `/home`
- Mount `WelcomeToast` on `/home` (keep vendor/admin mounts)

## Card alignment (landing)

- Shared min-height / `h-full` grid children for service, region, and feature card rows
- Consistent padding and title block alignment so rows read as one system

## Out of scope

- Redesigning vendor `/dashboard` or admin `/approvals` visuals
- New admin CRUD for catalog data
- Auth/session mechanics beyond redirect paths

## Verification

- Guest `/`: readable hero, Get Started → sign-up, aligned cards
- Customer login → `/home`; revisit `/` → redirect `/home`
- Vendor → `/dashboard`; admin → `/approvals`
- `npm run typecheck && npm test && npm run build`
