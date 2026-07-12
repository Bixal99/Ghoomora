# Role-Based UX Design (Part 3)

**Date:** 2026-07-12  
**Status:** Implemented

## Objective

One landing page with role-aware CTAs and navigation. Hide links, sections, and actions until the user can act on them. No schema or auth mechanics changes.

## Role homes (post-login)

| Role | Default destination |
|------|---------------------|
| Guest | — |
| CUSTOMER | `/` |
| VENDOR | `/dashboard` |
| ADMIN | `/approvals` |

Implemented in `components/auth/sign-in-form.tsx`, `components/auth/sign-up-form.tsx`, and auth-page redirect in `proxy.ts`.

## Landing hero CTAs (`/`)

| Viewer | Primary CTA | Secondary |
|--------|---------------|-----------|
| Guest | Get Started → `/sign-up` | — |
| Customer (0 bookings) | Explore Plans → `/trip-builder` | — |
| Customer (≥1 booking) | Explore Plans → `/trip-builder` | My Bookings → `/bookings` |
| Vendor | Go to Dashboard → `/dashboard` | — |
| Admin | Go to Approvals → `/approvals` | Explore Plans → `/trip-builder` |

Server component: `components/home-hero-cta.tsx` via `getActor()` + booking count.

Pending vendor applications: no global banner; status only on `/profile`.

## Public navigation

Centralized in `lib/navigation.ts`. Server shells (`site-header-shell.tsx`, `inner-header-shell.tsx`) pass link sets to client headers.

| Role | Nav |
|------|-----|
| Guest | Regions, Packages, Trip builder |
| Customer | Above + Bookings; Become a vendor (if no pending app) |
| Vendor | Dashboard, My Tours, Bookings |
| Admin | Approvals, Analytics |

Footer partner links (`/dashboard`, `/approvals`) remain intentional discovery paths for operators.

## Vendor portal

`PortalShell` filters nav by `vendor.types`:

- TRANSPORT → Fleet
- HOTEL → Hotels
- GUIDE → Guide profile
- CAMP → Camps
- All approved vendors → Packages, Bookings
- Overview always shown
- No separate Analytics nav (metrics on dashboard)

Empty states on fleet, hotels, camps, packages when inventory is zero.

## Admin approvals

URL tabs: `?tab=pending` (default), `approved`, `rejected`. Pending queue shows approve/reject actions; history tabs are read-only.

## Progressive disclosure

- Package configurator: itemized breakdown after tier, pickup, days, travelers set
- Checkout: local 4x4 line only when > 0
- AI assistant: collapsed in `<details>` until opened
- Booking voucher: CONFIRMED / IN_PROGRESS / COMPLETED only (UI + API)
- Review: COMPLETED only; hint before completion

## Server verification

Role-gated nav and CTAs are computed in Server Components using `getActor()`. Client `useSession()` is used only for avatar/sign-out interactivity; menu items are passed from server props where possible.

## Out of scope

- Prisma schema changes
- VendorApplication approval mechanics
- Middleware path-protection matrices (`VENDOR_PATHS`, `ADMIN_PATHS`)
- Pricing formulas
