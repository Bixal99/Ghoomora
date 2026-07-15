<div align="center">

# ⛰ Ghoomora

### *Go beyond the postcard.*

**Northern Pakistan, thoughtfully planned.**

Discover mountain regions · Compare verified trip packages · Plan with local operators  
Built for the roads, seasons, and transport realities of **Gilgit-Baltistan**, **Kashmir**, and **Khyber Pakhtunkhwa**.

<br />

<img src="docs/assets/ghoomora-hero.png" alt="Ghoomora — GO BEYOND the Postcard" width="920" />

<br />

<!-- Status & stack badges -->

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-000000?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](#license)

<br />

[![Explore](https://img.shields.io/badge/🚀_Explore-Quick_Start-1B4332?style=flat-square)](#-quick-start)
[![Features](https://img.shields.io/badge/✨_Features-Catalog-2D6A4F?style=flat-square)](#-features)
[![Stack](https://img.shields.io/badge/🧰_Stack-Tech-40916C?style=flat-square)](#-tech-stack)
[![Routes](https://img.shields.io/badge/🗺_Routes-Map-52B788?style=flat-square)](#-key-routes)
[![Partners](https://img.shields.io/badge/🤝_Partners-Portal-74C69D?style=flat-square)](#-for-partners)
[![Admin](https://img.shields.io/badge/🛡_Admin-Console-95D5B2?style=flat-square)](#-for-admins)

</div>

---

## 📑 Table of contents

| | | |
| --- | --- | --- |
| [Overview](#-what-is-ghoomora) | [Features](#-features) | [Tech stack](#-tech-stack) |
| [Architecture](#-architecture) | [Data model](#-data-model) | [Transport pricing](#-transport--pricing-model) |
| [Quick start](#-quick-start) | [Environment](#-environment-variables) | [Auth](#-authentication) |
| [Routes](#-key-routes) | [Partners](#-for-partners) | [Admins](#-for-admins) |
| [Scripts](#-scripts) | [Project layout](#-project-layout) | [Product principles](#-product-principles) |
| [Integrations](#-external-integrations) | [Validation](#-validation--quality) | [Docs & license](#-further-documentation) |

---

## 🌄 What is Ghoomora?

Ghoomora is a **full-stack multi-tenant tourism platform** that connects travelers with verified northern Pakistan operators. It is closer to *Airbnb + Booking.com + Komoot* than a brochure site — trip discovery, multi-vendor inventory (transport, hotels, guides, camps), route visualization, weather context, and safety amenities in one app.

| 👤 Role | What they do |
| --- | --- |
| **Customer** | Browse regions & destinations, compare packages, configure pricing, book, download PDF vouchers |
| **Vendor** | Onboard once; manage fleet, hotels, camps, guides, and packages from a unified dashboard |
| **Admin** | Approve vendor applications, verify profiles, monitor analytics |

> 🏔️ *Every destination belongs to a real region in the database — browse by geography first, then narrow by season, altitude, trip length, and comfort tier.*

### Why Ghoomora?

| Pain point | How Ghoomora addresses it |
| --- | --- |
| Opaque “all-in” trip prices | **Itemized pricing** — pickup, accommodation, and local 4×4 hire as separate lines |
| Brochure sites with no operators | **Verified vendors** with inventory that actually books |
| Flat destination lists | **Region → destination** hierarchy with elevation, season, and terrain |
| No road / weather context | **Open-Meteo advisories** + MapLibre route & elevation |
| Safety is tribal knowledge | **Overpass / OSM** hospitals, police, fuel, checkpoints |

---

## ✨ Features

### 🎒 For travelers

| Feature | What you get |
| --- | --- |
| 🗺 **Region explorer** | Gilgit-Baltistan, Kashmir, and KPK with elevation, season, and terrain context |
| 📦 **Package catalog** | Standard · Moderate · Luxury tiers with transparent, itemized pricing |
| 🧭 **Trip builder** | Match packages to your constraints; optional AI-assisted itinerary suggestions |
| 🛣 **Route maps** | MapLibre visualization with elevation profiles via OpenRouteService |
| 🌤 **Weather advisories** | Open-Meteo forecasts with risk badges *(model-based, not road closures)* |
| 🛡 **Safety dashboard** | Nearby hospitals, police, fuel, and checkpoints via Overpass / OpenStreetMap |
| 🧾 **Checkout & vouchers** | Complete bookings and download itemized PDF e-vouchers |
| 🔐 **Auth** | Email/password + OTP verification, Google OAuth, password reset |

### 🏪 For partners (vendors)

| Feature | What you get |
| --- | --- |
| 🧩 **Unified onboarding** | One account can represent transport, hotels, guides, camps — or any combination |
| 📋 **Vendor application** | Business name, phone, CNIC, services, optional document → admin review |
| 🚗 **Inventory** | Fleet, hotels/rooms, camps, guide profiles, package editor |
| 💰 **Live pricing inputs** | Pickup fares, local day-hire rates, and room tiers feed the configurator |
| ✅ **Approval workflow** | Submit → pending banner → admin verify → public visibility |
| 📊 **Partner dashboard** | Overview of vehicles, properties, and packages at a glance |

### 🛡 For admins

| Feature | What you get |
| --- | --- |
| ✅ **Vendor approvals** | Full application review at `/approvals` — approve or reject with notes |
| 📈 **Analytics** | Platform-level insights at `/analytics` |
| 🔑 **Bootstrap admin** | Single admin via `ADMIN_EMAIL` / `ADMIN_PASSWORD` + `npm run admin:create` |

---

## 🧰 Tech stack

<div align="center">

### Core

[![Tech](https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,nodejs&theme=dark)](https://skillicons.dev)

### UI, motion & maps

[![Tech](https://skillicons.dev/icons?i=threejs,framer,vite&theme=dark)](https://skillicons.dev)
&nbsp;
<img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
<img src="https://img.shields.io/badge/MapLibre-1E90FF?style=for-the-badge&logo=maplibre&logoColor=white" alt="MapLibre" />
<img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" alt="OSM" />

### Auth, AI, media & realtime

<img src="https://img.shields.io/badge/Auth.js-000000?style=for-the-badge&logo=auth0&logoColor=white" alt="Auth.js" />
<img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
<img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=meta&logoColor=white" alt="Groq" />
<img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
<img src="https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white" alt="Resend" />
<img src="https://img.shields.io/badge/Pusher-300D4F?style=for-the-badge&logo=pusher&logoColor=white" alt="Pusher" />
<img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
<img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Recharts" />

</div>

<br />

| Layer | Technology | Notes |
| --- | --- | --- |
| 🖥 **Framework** | Next.js **16** (App Router), React **19**, TypeScript **6** | Server Actions + Route Handlers |
| 🎨 **Styling & UI** | Tailwind CSS **4**, Radix / shadcn-style primitives, Lucide, Poppins | CVA + `clsx` + `tailwind-merge` |
| ✨ **Motion** | Framer Motion (app-wide), **GSAP + Three.js** (landing hero only) | Animated cold-load + route transitions |
| 🗄 **Database** | Prisma **7** + PostgreSQL | Local Postgres for dev; Neon (or compatible) in production |
| 🔐 **Auth** | Auth.js (NextAuth **v5**) | Credentials + optional Google; DB sessions via Prisma adapter |
| 🗺 **Maps & routing** | MapLibre GL, OpenStreetMap, OpenRouteService | Multi-waypoint routes + elevation |
| 🌦 **Weather & safety** | Open-Meteo, Overpass API | Advisories + amenity lookups |
| 🤖 **AI** | Groq (`llama-3.3-70b-versatile`) | Demo mode without API key |
| 📡 **Realtime** | Pusher | Optional live trip tracking |
| 📄 **Documents** | `@react-pdf/renderer` | Itemized booking e-vouchers |
| ✅ **Validation** | Zod **4** | Forms, actions, API payloads |
| ☁️ **Media** | Cloudinary | Images + vendor application documents |
| ✉️ **Email** | Resend | Sign-up OTP + password reset |
| 🧪 **Tests** | Vitest | Unit tests for pricing, auth, weather, routes, Overpass |

---

## 🏗 Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    pages[App Router pages]
    components[React components]
    maps[MapLibre / Recharts]
  end

  subgraph server [Next.js server]
    actions[Server Actions]
    api[Route Handlers]
    auth[getActor / Auth.js]
    proxy[proxy.ts role gates]
  end

  subgraph data [Data & services]
    prisma[Prisma + PostgreSQL]
    ors[OpenRouteService]
    meteo[Open-Meteo]
    groq[Groq AI]
    overpass[Overpass OSM]
    cloudinary[Cloudinary]
    resend[Resend]
    pusher[Pusher]
  end

  pages --> actions
  pages --> api
  pages --> maps
  proxy --> pages
  actions --> auth
  api --> auth
  auth --> prisma
  actions --> prisma
  api --> prisma
  api --> ors
  api --> groq
  api --> overpass
  api --> pusher
  pages --> meteo
  actions --> cloudinary
  actions --> resend
```

### Request flow (simplified)

```
Browser  →  proxy.ts (role-aware)  →  Page / Server Action / API
                                         │
                                         ├─ Auth.js session (Prisma Session)
                                         ├─ Prisma queries
                                         └─ External APIs (ORS, Groq, Overpass, …)
```

---

## 🗂 Data model

Core Prisma entities (see `prisma/schema.prisma`):

| Domain | Models |
| --- | --- |
| 🌍 **Geography** | `Region` → `Destination` · `PickupCity` · `SafetyPoint` |
| 👥 **Identity** | `User` (`CUSTOMER` / `VENDOR` / `ADMIN`) · `Account` · `Session` |
| 🏪 **Vendors** | `VendorApplication` · `Vendor` (`TRANSPORT` / `HOTEL` / `GUIDE` / `CAMP`) |
| 🚗 **Transport** | `Vehicle` · `VehicleFare` · `LocalHireRate` |
| 🏨 **Stay** | `Hotel` · `Room` · `CampSite` · `GuideProfile` |
| 📦 **Products** | `Package` · `PackageTier` · `PackageStop` |
| 🧾 **Commerce** | `Booking` · `Traveler` · `Review` |

```mermaid
erDiagram
  Region ||--o{ Destination : contains
  Destination ||--o{ PackageStop : stops
  Vendor ||--o{ Package : offers
  Package ||--o{ PackageTier : priced_as
  Package ||--o{ PackageStop : itinerary
  User ||--o{ Booking : places
  PackageTier ||--o{ Booking : selected
  PickupCity ||--o{ Booking : from
  Vendor ||--o{ Vehicle : fleet
  Vehicle ||--o{ VehicleFare : fares
  Vehicle ||--o{ LocalHireRate : local_hire
```

---

## 🚙 Transport & pricing model

Ghoomora keeps **two independent transport layers** — never collapse them into one field.

### Layer 1 — Pickup leg *(origin city → destination region)*

| Option | Vehicle | Mode | Billing |
| --- | --- | --- | --- |
| Bus with group | `COASTER` | `SHARED` | Per seat |
| Private bus | `COASTER` | `PRIVATE` | Whole vehicle |
| Private car | `CAR` | `PRIVATE` | Whole vehicle |

Fares live in `VehicleFare` keyed by **pickup city × region × mode** — not a flat price on the vehicle.

### Layer 2 — Local day-hire

Certain destinations (e.g. Fairy Meadows, Deosai) require a local `WAGON` / `LAND_CRUISER` / `PRADO` / `JEEP`. Billed as its own line via `LocalHireRate` when `Destination.requiresLocalTransport = true`.

### Tier mapping *(maps onto Layer 1)*

| Tier | Pickup | Accommodation | Extras |
| --- | --- | --- | --- |
| **Standard** | Shared bus | Budget | Local hire billed separately |
| **Moderate** | Private car | Mid-tier | Optional guide; local hire separate |
| **Luxury** | Private bus/car | Luxury | Guide + photographer; local hire often bundled |

### Price formula

```
Booking.totalPrice =
    pickupFare(vehicleType, transportMode, pickupCity, region)
  + tier.pricePerPersonPerDay × selectedDays × travelerCount
  + Σ localHireRate.pricePerDay   // for stops with requiresLocalTransport
```

`selectedDays` is validated against `Package.minDays` / `maxDays`. PDF vouchers **itemize** pickup, stay, and local hire — never one opaque number.

---

## 🚀 Quick start

### Prerequisites

| Requirement | Details |
| --- | --- |
| ✅ **Node.js 20+** | LTS recommended |
| ✅ **PostgreSQL** | Local via pgAdmin / `createdb`; Neon (or compatible) for production |
| ✅ **npm** | Comes with Node |

### 1️⃣ Clone and install

```powershell
git clone <your-repo-url>
cd travel_ui_ux-main
npm install
```

### 2️⃣ Configure environment

Your **`.env` stays on your machine** — it is gitignored and must never be committed.

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in credentials using `.env.example` as the template.

### 3️⃣ Database

Create an empty database, then point `DATABASE_URL` at it — e.g.  
`postgresql://postgres:YOUR_PASSWORD@localhost:5432/ghoomora`

```powershell
npm run db:migrate
npm run admin:create
```

This applies the schema and creates the **single** admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (idempotent).

> ⚠️ Regions, destinations, and pickup cities are **not** auto-seeded. Add them via Prisma Studio — see [`docs/ADDING_REAL_DATA.md`](docs/ADDING_REAL_DATA.md).

### 4️⃣ Run locally

```powershell
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

| State | What you see |
| --- | --- |
| No database | Public pages show setup guidance |
| DB empty | Empty-state UI |
| Auth / DB not ready | Partner & admin pages show setup guidance |

---

## 🔐 Environment variables

### Required

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Auth.js sessions too) |
| `AUTH_SECRET` | Auth.js signing secret — `npx auth secret` |
| `AUTH_URL` | Auth base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | App origin for metadata / links |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed-only bootstrap admin (`npm run admin:create`) |
| `ADMIN_NAME` | Display name for bootstrap admin |

### Recommended & optional

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` / `EMAIL_FROM` | Sign-up OTP + password reset email |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (“Continue with Google”) |
| `AUTH_REMEMBER_ME_MAX_AGE_DAYS` | Remember-me cookie Max-Age (default 30) |
| `AUTH_DEFAULT_MAX_AGE_DAYS` | Default session length in days (default 1) |
| `ORS_API_KEY` | OpenRouteService route visualization |
| `GROQ_API_KEY` | AI trip planner (demo fallback without it) |
| `NEXT_PUBLIC_PUSHER_KEY` / `PUSHER_*` | Live trip tracking |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_*` | Image uploads & vendor documents |

<details>
<summary><b>📧 Resend email notes</b></summary>

- Test sender `onboarding@resend.dev` only delivers to your Resend account email.
- Other addresses print the OTP / reset link in the `npm run dev` terminal (`[email-otp]`).
- Production: verify a domain and set `EMAIL_FROM` to that domain.

</details>

<details>
<summary><b>🔑 Google OAuth notes</b></summary>

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- New Google users are created automatically and marked verified (no OTP).
- Without `AUTH_GOOGLE_*`, the Google button is hidden.

</details>

> 🚨 **Security:** If `.env` was ever pushed to a remote, rotate every secret (`DATABASE_URL`, `AUTH_SECRET`, Groq, Cloudinary, Pusher, ORS, Resend) before deploying.

---

## 🔓 Authentication

Self-hosted with [Auth.js v5](https://authjs.dev/):

| Capability | Details |
| --- | --- |
| ✉️ **Email / password** | Credentials provider · hashed with bcrypt |
| 🔢 **Email OTP** | 6-digit code at `/verify-email` after `/sign-up` (`emailVerified` required) |
| 🔵 **Google OAuth** | Optional; auto-verified |
| 🗄 **Sessions** | Database-backed via Prisma adapter (admins can revoke / role-refresh instantly) |
| 🔁 **Password reset** | `/forgot-password` → email link → `/reset-password?token=…` (verified accounts only) |
| 🧭 **Explore trips CTA** | Header CTA shown only when a customer is signed in |

Config lives in `auth.ts`, `auth.config.ts`, and `app/api/auth/[...nextauth]/`. Role gates use `proxy.ts` (Next.js 16).

---

## 🗺 Key routes

### 🌐 Public

| Route | Description |
| --- | --- |
| `/` | Landing — Three.js/GSAP hero, regions, featured destinations |
| `/home` | Signed-in customer home |
| `/regions/[slug]` | Region explorer with destination cards |
| `/destinations/[slug]` | Detail, weather forecast, safety amenities |
| `/packages` | Verified package catalog with filters |
| `/packages/[id]` | Live pricing configurator + route map |
| `/trip-builder` | Match packages + AI-assisted planning |
| `/checkout` | Complete a booking |
| `/sign-in` · `/sign-up` | Auth.js email/password (+ Google when configured) |
| `/verify-email` | 6-digit OTP after email/password sign-up |
| `/forgot-password` · `/reset-password` | Request and complete a password reset |

### 🏪 Partner

| Route | Description |
| --- | --- |
| `/dashboard` | Partner overview and onboarding |
| `/fleet` | Vehicle inventory |
| `/hotels` | Hotel and room tiers |
| `/camps` | Camp listings |
| `/guide-profile` | Guide profile editor |
| `/vendor/packages` | Package builder |

### 🛡 Admin

| Route | Description |
| --- | --- |
| `/approvals` | Verify or revoke partner profiles |
| `/analytics` | Platform analytics |

### 👤 Account

| Route | Description |
| --- | --- |
| `/profile` | User profile · **Become a vendor** application |
| `/bookings` | Booking list |
| `/bookings/[id]` | Booking detail, status, PDF voucher download |

### 🔌 API

| Route | Description |
| --- | --- |
| `/api/auth/[...nextauth]` | Auth.js handlers |
| `/api/ai-planner` | AI itinerary + cost estimation |
| `/api/route` | OpenRouteService routing |
| `/api/safety` | Overpass amenity lookup |
| `/api/tracking` | Pusher live tracking |
| `/api/bookings/[id]/voucher` | PDF e-voucher download (GET) |

---

## 🤝 For partners

1. **Sign up** at `/sign-up` — every account starts as a `CUSTOMER`.
2. Open **`/profile`** → **Become a vendor** (business name, phone, CNIC, description, services, optional document).
3. Profile shows an **Application under review** banner while pending.
4. Admin reviews at `/approvals`:
   - **Approve** → role becomes `VENDOR`, vendor profile created, dashboard unlocks.
   - **Reject** → optional note; applicant can reapply.
5. Add inventory — fleet, hotels, camps, and/or guides.
6. Create packages at `/vendor/packages` with stops, tiers, and day ranges.
7. Once verified, packages appear in the public catalog.

```
CUSTOMER ──apply──▶ PENDING ──admin──▶ VENDOR (verified packages go live)
                         │
                         └──reject──▶ can reapply from /profile
```

---

## 🛡 For admins

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run admin:create`.
2. There is **no admin sign-up path** in the app — exactly one bootstrap admin.
3. Sign in at `/sign-in`.
4. Open **`/approvals`** for full application context (business, phone, CNIC, services, document).
5. **Approve** (atomic role + profile) or **Reject** with a visible note.
6. Use **`/analytics`** for platform-level insights.

> Approval — not sign-up — promotes a user to `VENDOR`. Verification controls public package visibility.

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run admin:create` | Create bootstrap admin from `ADMIN_*` env |

---

## 📁 Project layout

```
app/
  page.tsx                     # Landing — hero, regions, featured destinations
  loading.tsx                  # Full-screen hero loader (GSAP + Framer Motion)
  home/                        # Signed-in customer home
  trip-builder/                # Trip matching + AI planner
  packages/                    # Catalog, detail, configurator
  destinations/[slug]/         # Destination detail, weather, safety
  regions/[slug]/              # Region explorer
  checkout/                    # Booking checkout
  bookings/                    # Booking list + detail + PDF voucher
  dashboard/                   # Partner overview (VENDOR-gated)
  fleet/ hotels/ camps/        # Partner inventory
  guide-profile/               # Guide editor
  vendor/packages/             # Partner package editor
  analytics/ approvals/        # Admin dashboards
  profile/                     # Account + vendor application
  sign-in/ sign-up/            # Auth pages
  verify-email/                # OTP verification
  forgot-password/             # Request password reset
  reset-password/              # Set new password from email link
  actions/                     # Server Actions (auth, booking, vendor, admin, …)
  api/
    auth/[...nextauth]/        # Auth.js
    ai-planner/                # Groq itinerary + cost
    bookings/[id]/voucher/     # PDF download
    route/                     # OpenRouteService
    safety/                    # Overpass
    tracking/                  # Pusher

components/
  hero-scene.tsx               # Three.js + GSAP hero background
  loading-screen.tsx           # Animated route transition loader
  cold-load-screen.tsx         # Initial load experience
  reactbits/                   # Gradient text & UI effects
  map/                         # Route maps, elevation charts
  auth/                        # Sign-in/up, OTP, Google, password reset
  ai-trip-assistant.tsx        # AI planning form
  package-configurator.tsx     # Live pricing UI
  safety-dashboard.tsx         # OSM amenities
  weather-forecast.tsx         # Open-Meteo UI
  …                            # Cards, headers, portal shell, vouchers, etc.

lib/                           # Data, pricing, auth, AI, weather, Overpass, email
auth.ts / auth.config.ts       # Auth.js (adapter, providers, sessions)
prisma/                        # Schema + migrations
proxy.ts                       # Auth.js role-based middleware (Next.js 16)
scripts/create-admin.ts        # Admin bootstrap
tests/                         # Vitest suites
docs/                          # Operator docs + README assets
```

---

## 🧭 Product principles

| Principle | Rule |
| --- | --- |
| 🚙 **Two-layer transport** | Pickup fares and local 4×4 day-hire are always separate line items |
| 🌤 **Weather badges** | Open-Meteo is model-based — not confirmed closures or official warnings |
| 🛡 **Safety data** | Overpass lookups degrade gracefully when mirrors are slow |
| 🤖 **AI suggestions** | Only references destinations already in the Ghoomora database |
| 📍 **Geocoding** | Follow [`docs/GEOCODING_BACKLOG.md`](docs/GEOCODING_BACKLOG.md) before adding places |
| ✨ **Motion budget** | GSAP + Three.js on the landing hero only; Framer Motion elsewhere |

---

## 🧩 External integrations

| Service | Used for | Required? |
| --- | --- | --- |
| 🐘 **PostgreSQL** | Primary data + Auth.js sessions | ✅ Yes |
| 🔑 **Auth.js** | Sessions, credentials, Google | ✅ Yes |
| ✉️ **Resend** | OTP + password reset mail | Recommended |
| 🗺 **OpenRouteService** | Multi-waypoint routes + elevation | Recommended |
| 🌦 **Open-Meteo** | Destination weather advisories | Optional (public) |
| 🛡 **Overpass / OSM** | Safety amenities | Optional (public) |
| 🤖 **Groq** | AI trip planner | Optional (demo fallback) |
| ☁️ **Cloudinary** | Image / document uploads | Optional |
| 📡 **Pusher** | Live trip tracking | Optional |

---

## ✅ Validation & quality

Run before opening a pull request or deploying:

```powershell
npm run typecheck
npm test
npx prisma validate
npm run build
```

| Check | Command |
| --- | --- |
| Types | `npm run typecheck` |
| Unit tests | `npm test` |
| Schema | `npx prisma validate` |
| Lint | `npm run lint` |
| Production build | `npm run build` |

---

## 📚 Further documentation

| Doc | Contents |
| --- | --- |
| [`docs/ADDING_REAL_DATA.md`](docs/ADDING_REAL_DATA.md) | How to add regions, destinations, pickup cities |
| [`docs/GEOCODING_BACKLOG.md`](docs/GEOCODING_BACKLOG.md) | Geocoding notes before seeding new places |
| [`Build.md`](Build.md) | Original product / build prompt & transport rules |
| [`.env.example`](.env.example) | Full env template with comments |

---

## 📄 License

**Private project. All rights reserved.**

Unauthorized copying, distribution, or commercial use is prohibited without explicit permission.

---

<div align="center">

<img src="docs/assets/ghoomora-hero.png" alt="Ghoomora hero" width="640" />

<br /><br />

### ⛰ Ghoomora

**Built for real roads.**

*Northern Pakistan — planned with operators who know the passes.*

<br />

[![Next.js](https://img.shields.io/badge/Made_with-Next.js_16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Typed-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

<br />

`npm run dev` → [localhost:3000](http://localhost:3000)

</div>
