# Ghoomora

**Northern Pakistan, thoughtfully planned.**

Ghoomora is a travel platform for discovering mountain regions, comparing verified trip packages, configuring transparent pricing, and managing partner inventory — built for the roads, seasons, and transport realities of Gilgit-Baltistan, Kashmir, and Khyber Pakhtunkhwa.

---

## Highlights

| For travelers | For partners |
|---|---|
| Browse regions and destinations with elevation, season, and difficulty context | Partner portal for fleet, hotels, guides, camps, and packages |
| Compare Standard / Moderate / Luxury tiers with itemized pickup + local 4×4 pricing | Clerk-authenticated onboarding and admin approval workflow |
| Trip builder with AI-assisted itinerary suggestions | Live inventory: fares, local day-hire rates, room tiers |
| Package route maps, elevation profiles, and weather advisories | Analytics dashboard for admins |
| Checkout, booking vouchers (PDF), and reviews | Webhook-synced user profiles via Clerk |

---

## Stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript
- **UI** — Tailwind CSS 4, Poppins, Framer Motion, GSAP + Three.js hero
- **Data** — Prisma 7, PostgreSQL (Neon)
- **Auth** — Clerk (webhooks → Neon user sync)
- **Maps & routes** — MapLibre GL, OpenStreetMap, OpenRouteService
- **Weather & safety** — Open-Meteo forecasts, Overpass API (OSM amenities)
- **AI** — Groq (`llama-3.3-70b-versatile`) for trip planning
- **Realtime** — Pusher (optional live trip tracking)
- **PDF** — `@react-pdf/renderer` booking vouchers

---

## Quick start

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application (publishable + secret keys)

### 1. Clone and install

```powershell
git clone <your-repo-url>
cd travel_ui_ux-main
npm install
```

### 2. Environment variables (local only)

Your **`.env` file stays on your machine** — it is listed in `.gitignore` and must never be committed or pushed.

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in your real credentials. Use `.env.example` as the reference; only the example template belongs in git.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend key |
| `CLERK_SECRET_KEY` | Yes | Clerk backend key |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes | Verify `/api/webhooks/clerk` events |
| `ADMIN_EMAILS` | Yes | Comma-separated admin emails (normalized) |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `http://localhost:3000` |
| `ORS_API_KEY` | Recommended | Package route visualization |
| `GROQ_API_KEY` | Optional | AI trip planner (demo mode without it) |
| `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_*` | Optional | Live trip tracking |
| `CLOUDINARY_*` | Optional | Image uploads |

> **Security:** If `.env` was ever pushed to a remote, rotate every secret in that file (Neon, Clerk, Groq, Cloudinary, Pusher, ORS) before deploying.

### 3. Database

```powershell
npm run db:migrate
npm run db:seed
```

### 4. Clerk webhook

In the Clerk dashboard, add a webhook endpoint:

```
https://<your-domain>/api/webhooks/clerk
```

Subscribe to `user.created` and `user.updated`. Copy the signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`.

Partner sign-in uses `/sign-in` and returns to `/dashboard` after authentication.

### 5. Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without credentials, public routes run in **sample-data mode**. Protected partner and admin pages show setup guidance instead of failing silently.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build (includes `prisma generate`) |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed regions, destinations, sample packages |
| `npm run db:generate` | Regenerate Prisma client |

---

## Project layout

```
app/
  page.tsx                 # Home — hero, regions, featured destinations
  trip-builder/            # Trip matching + AI planner
  packages/                # Package catalog and detail + configurator
  destinations/[slug]/     # Destination detail, weather, safety
  checkout/                # Booking checkout
  bookings/[id]/           # Booking detail + PDF voucher
  dashboard/               # Partner onboarding & overview
  fleet/ hotels/ camps/    # Partner inventory pages
  vendor/packages/         # Partner package editor
  analytics/ approvals/    # Admin dashboards
components/
  reactbits/               # Animated loader & gradient text
  map/                     # Route experience, elevation charts
lib/                       # Data, pricing, auth, AI, weather, Overpass
prisma/                    # Schema, migrations, seed data
proxy.ts                   # Clerk middleware (Next.js 16)
```

---

## Key routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/regions/[slug]` | Region explorer |
| `/destinations/[slug]` | Destination detail, forecast, safety |
| `/packages` | Verified packages |
| `/packages/[id]` | Live pricing configurator |
| `/trip-builder` | Match packages + AI assistant |
| `/checkout` | Complete a booking |
| `/dashboard` | Partner portal entry |
| `/sign-in` | Clerk authentication |

---

## Validation

```powershell
npm run typecheck
npm test
npx prisma validate
npm run build
```

---

## Product notes

- **Transport model** — Pickup fares and local 4×4 day-hire are priced separately; Luxury tier may bundle local transport.
- **Weather badges** — Open-Meteo advisories are model-based; they are not confirmed road closures.
- **Safety data** — Overpass lookups degrade gracefully when public mirrors are unavailable.
- **Geocoding** — See [`docs/GEOCODING_BACKLOG.md`](docs/GEOCODING_BACKLOG.md) before adding destinations outside the seeded network.

---

## License

Private project. All rights reserved.
