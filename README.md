<div align="center">

# Ghoomora

**Northern Pakistan, thoughtfully planned.**

Discover mountain regions, compare verified trip packages, and plan with local operators — built for the roads, seasons, and transport realities of Gilgit-Baltistan, Kashmir, and Khyber Pakhtunkhwa.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-000000?style=flat-square)](https://authjs.dev/)

[Explore the app](#quick-start) · [Routes](#key-routes) · [Partner portal](#for-partners) · [Admin](#for-admins)

</div>

---

## What is Ghoomora?

Ghoomora is a full-stack travel platform that connects travelers with verified northern Pakistan operators. It treats **pickup transport** and **local 4×4 day-hire** as separate line items, surfaces weather and safety context at the destination level, and gives partners one dashboard to manage fleet, hotels, guides, camps, and packages.

> *Go beyond the postcard.* Every destination belongs to a real region in the database — browse by geography first, then narrow by season, altitude, trip length, and comfort tier.

---

## Features

### For travelers

| Feature | Description |
| --- | --- |
| **Region explorer** | Browse Gilgit-Baltistan, Kashmir, and KPK with elevation, season, and terrain context |
| **Package catalog** | Compare Standard, Moderate, and Luxury tiers with transparent, itemized pricing |
| **Trip builder** | Match packages to your constraints; optional AI-assisted itinerary suggestions |
| **Route maps** | MapLibre visualization with elevation profiles via OpenRouteService |
| **Weather advisories** | Open-Meteo forecasts with risk badges (model-based, not road closures) |
| **Safety dashboard** | Nearby hospitals, police, fuel, and checkpoints via Overpass / OpenStreetMap |
| **Checkout & vouchers** | Complete bookings and download itemized PDF e-vouchers |

### For partners

| Feature | Description |
| --- | --- |
| **Unified onboarding** | One account can represent transport, hotels, guides, camps — or any combination |
| **Inventory management** | Fleet, hotels, camps, guide profiles, and package editor |
| **Live pricing inputs** | Pickup fares, local day-hire rates, and room tiers feed the configurator |
| **Approval workflow** | Submit profile for review; admin verification unlocks public visibility |
| **Partner dashboard** | Overview of vehicles, properties, and packages at a glance |

### For admins

| Feature | Description |
| --- | --- |
| **Vendor approvals** | Review and verify partner profiles at `/approvals` |
| **Analytics** | Platform-level insights at `/analytics` |
| **Role assignment** | Admin access via `ADMIN_EMAILS` in environment config |

---

## Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & motion** | Tailwind CSS 4, Poppins, Framer Motion, GSAP, Three.js hero scene |
| **Database** | Prisma 7 + PostgreSQL (local for development; Neon or compatible in production) |
| **Auth** | Auth.js (NextAuth v5) — Credentials provider, database sessions via Prisma adapter |
| **Maps & routing** | MapLibre GL, OpenStreetMap, OpenRouteService |
| **Weather & safety** | Open-Meteo, Overpass API |
| **AI** | Groq (`llama-3.3-70b-versatile`) — demo mode without API key |
| **Realtime** | Pusher (optional live trip tracking) |
| **Documents** | `@react-pdf/renderer` booking vouchers |
| **Validation** | Zod 4 |

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    pages[App Router pages]
    components[React components]
  end

  subgraph server [Next.js server]
    actions[Server Actions]
    api[Route Handlers]
    auth[getActor / Auth.js]
  end

  subgraph data [Data & services]
    prisma[Prisma + PostgreSQL]
    ors[OpenRouteService]
    meteo[Open-Meteo]
    groq[Groq AI]
    overpass[Overpass OSM]
  end

  pages --> actions
  pages --> api
  actions --> auth
  api --> auth
  auth --> prisma
  actions --> prisma
  api --> prisma
  api --> ors
  api --> groq
  pages --> meteo
  pages --> overpass
```

---

## Quick start

### Prerequisites

- **Node.js 20+**
- Local PostgreSQL (e.g. via pgAdmin 4) for development — production can use Neon or any Postgres-compatible provider

### 1. Clone and install

```powershell
git clone <your-repo-url>
cd travel_ui_ux-main
npm install
```

### 2. Configure environment

Your **`.env` file stays on your machine** — it is in `.gitignore` and must never be committed.

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in your credentials. Use `.env.example` as the reference template.

#### Required variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string — local Postgres for development; Neon or compatible for production (also backs Auth.js sessions) |
| `AUTH_SECRET` | Auth.js signing/encryption secret — generate with `npx auth secret` |
| `NEXT_PUBLIC_APP_URL` | App origin, e.g. `http://localhost:3000` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seed-only — create the single admin account (see [For admins](#for-admins)) |

#### Recommended & optional

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sign-up OTP + password reset via Resend. Test sender `onboarding@resend.dev` only mails your Resend account email; other addresses log the OTP/link to the server console. For production, verify a domain and set `EMAIL_FROM` to that domain. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth (“Continue with Google”) — redirect URI `http://localhost:3000/api/auth/callback/google` |
| `ORS_API_KEY` | Package route visualization (OpenRouteService) |
| `GROQ_API_KEY` | AI trip planner — falls back to demo suggestions without it |
| `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_*` | Live trip tracking |
| `CLOUDINARY_*` | Image uploads and vendor application documents |

> **Security:** If `.env` was ever pushed to a remote, rotate every secret (`DATABASE_URL`, `AUTH_SECRET`, Groq, Cloudinary, Pusher, ORS) before deploying.

### 3. Set up the database

Create an empty database in pgAdmin (or `createdb`), then point `DATABASE_URL` at it — for example `postgresql://postgres:YOUR_PASSWORD@localhost:5432/ghoomora` (no `sslmode` needed locally).

```powershell
npm run db:migrate
npm run admin:create
```

This applies the schema and creates the single admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (idempotent). Regions, destinations, and pickup cities are **not** auto-created — add them via Prisma Studio as described in [`docs/ADDING_REAL_DATA.md`](docs/ADDING_REAL_DATA.md).

### 4. Authentication

Authentication is fully self-hosted with [Auth.js v5](https://authjs.dev/) using an email/password (Credentials) provider, optional Google OAuth, and database-backed sessions stored in Postgres via the Prisma adapter.

- Generate `AUTH_SECRET` once with `npx auth secret` and paste it into `.env`.
- Email/password sign-up at `/sign-up` creates a `CUSTOMER` account, then requires a **6-digit email OTP** at `/verify-email` before sign-in works (`emailVerified` must be set).
- With Resend’s test sender (`onboarding@resend.dev`), OTP email only reaches the Resend account owner address; any other signup email prints the code in the `npm run dev` terminal (`[email-otp]`). For real delivery to any user, verify a domain and update `EMAIL_FROM`.
- Optional Google sign-in: set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. New Google users are created automatically and marked verified (no OTP).
- Sign in at `/sign-in`; database sessions let an admin revoke access or refresh a role instantly.
- Forgot password at `/forgot-password` emails a one-hour reset link to `/reset-password?token=…` for **verified** email/password accounts only (same Resend rules as OTP).
- The header **Explore trips** CTA is shown only when a customer is signed in.

### 5. Run locally

```powershell
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

Without a configured database, public catalog pages show setup guidance. When the database is connected but empty, they show an empty state. Protected partner and admin pages show setup guidance until Auth.js and the database are ready.

---

## Key routes

### Public

| Route | Description |
| --- | --- |
| `/` | Landing — hero, regions, featured destinations |
| `/regions/[slug]` | Region explorer with destination cards |
| `/destinations/[slug]` | Detail, weather forecast, safety amenities |
| `/packages` | Verified package catalog with filters |
| `/packages/[id]` | Live pricing configurator + route map |
| `/trip-builder` | Match packages + AI-assisted planning |
| `/checkout` | Complete a booking |
| `/sign-in` · `/sign-up` | Auth.js email/password (+ Google when configured) |
| `/verify-email` | 6-digit OTP after email/password sign-up |
| `/forgot-password` · `/reset-password` | Request and complete a password reset |

### Partner

| Route | Description |
| --- | --- |
| `/dashboard` | Partner overview and onboarding |
| `/fleet` | Vehicle inventory |
| `/hotels` | Hotel and room tiers |
| `/camps` | Camp listings |
| `/guide-profile` | Guide profile editor |
| `/vendor/packages` | Package builder |

### Admin

| Route | Description |
| --- | --- |
| `/approvals` | Verify or revoke partner profiles |
| `/analytics` | Platform analytics |

### Account

| Route | Description |
| --- | --- |
| `/profile` | User profile |
| `/bookings/[id]` | Booking detail, status, PDF voucher download |

---

## For partners

1. **Sign up** at `/sign-up` — every account starts as a `CUSTOMER`.
2. Open **`/profile`** and use **Become a vendor** to submit a vendor application (business name, phone, CNIC, description, services, and an optional document). Your profile shows an **Application under review** banner while it is pending.
3. An admin reviews the application. On approval your account becomes a `VENDOR`, a vendor profile is created, and the partner dashboard unlocks. If it is rejected you can reapply from your profile.
4. Add inventory — fleet, hotels, camps, or guides depending on your services.
5. Create packages at `/vendor/packages` with stops, tiers, and day ranges. Once verified, packages become visible in the public catalog.

---

## For admins

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run admin:create`. This creates exactly one admin account if none exists. There is no admin sign-up path in the app.
2. Sign in at `/sign-in` with that account.
3. Open **`/approvals`** to see each pending vendor application in full (business name, phone, CNIC, description, requested services, and any document).
4. **Approve** to create the vendor profile and grant `VENDOR` access in a single transaction, or **Reject** with an optional note the applicant can see.

Approval — not sign-up — is what promotes a user to `VENDOR`. Verification controls public package visibility.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build (includes `prisma generate`) |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run admin:create` | Create the bootstrap admin account from `ADMIN_*` env |
| `npm run db:generate` | Regenerate Prisma client |

---

## Project layout

```
app/
  page.tsx                  # Home — hero, regions, featured destinations
  loading.tsx               # Full-screen hero loader (GSAP + Framer Motion)
  trip-builder/             # Trip matching + AI planner
  packages/                 # Catalog, detail, and configurator
  destinations/[slug]/      # Destination detail, weather, safety
  regions/[slug]/           # Region explorer
  checkout/                 # Booking checkout
  bookings/[id]/            # Booking detail + PDF voucher
  dashboard/                # Partner overview (gated on VENDOR role)
  fleet/ hotels/ camps/     # Partner inventory
  vendor/packages/          # Partner package editor
  analytics/ approvals/     # Admin dashboards
  sign-in/ sign-up/         # Auth.js email/password (+ Google) pages
  verify-email/             # OTP verification after sign-up
  forgot-password/          # Request password reset email
  reset-password/           # Set a new password from email link
  api/
    auth/[...nextauth]/     # Auth.js route handlers
    ai-planner/             # AI itinerary + cost estimation
    bookings/[id]/voucher/  # PDF e-voucher download (GET)

components/
  loading-screen.tsx        # Animated route transition loader
  hero-scene.tsx            # Three.js + GSAP hero background
  reactbits/                # Gradient text and UI effects
  map/                      # Route maps, elevation charts
  ai-trip-assistant.tsx     # AI planning form

lib/                        # Data, pricing, auth, AI, weather, Overpass
auth.ts / auth.config.ts    # Auth.js configuration (adapter, providers, sessions)
prisma/                     # Schema and migrations
proxy.ts                    # Auth.js role-based middleware (Next.js 16)
```

---

## Product principles

**Two-layer transport pricing**
Pickup fares (bus/car from major cities) and local 4×4 day-hire are priced separately. Luxury tier may bundle local transport; Standard and Moderate show it as its own line.

**Weather badges**
Open-Meteo advisories are model-based indicators — they are not confirmed road closures or official warnings.

**Safety data**
Overpass amenity lookups degrade gracefully when public mirrors are slow or unavailable.

**AI suggestions**
The trip planner only references destinations already in Ghoomora's database. Set `GROQ_API_KEY` for live AI; otherwise demo suggestions are returned.

**Geocoding**
See [`docs/GEOCODING_BACKLOG.md`](docs/GEOCODING_BACKLOG.md) and [`docs/ADDING_REAL_DATA.md`](docs/ADDING_REAL_DATA.md) before adding destinations.

---

## Validation

Run before opening a pull request or deploying:

```powershell
npm run typecheck
npm test
npx prisma validate
npm run build
```

---

## License

Private project. All rights reserved.

---

<div align="center">

**Ghoomora** — *Built for real roads.*

</div>
