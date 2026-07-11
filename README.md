# Ghoomora

Ghoomora is a responsive tourism web application for discovering and planning travel across Northern Pakistan. This repository implements the Phase 1–3 MVP: destination data, regional discovery, package tiers, trip matching, vendor inventory, and admin approvals.

## Stack

- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS 4 and shadcn-style UI primitives
- Prisma 7 with PostgreSQL/Neon
- Clerk authentication and webhook user synchronization
- MapLibre GL with OpenStreetMap tiles
- GSAP + Three.js for the landing hero; Framer Motion elsewhere
- OpenRouteService for package road routes and elevation
- Recharts for elevation profiles
- Open-Meteo for seven-day mountain-weather advisories

## Local setup

1. Copy .env.example to .env and configure Neon and Clerk.
2. Install dependencies with npm install.
3. Apply the Prisma migration with npm run db:migrate.
4. Seed the verified primary destination data with npm run db:seed.
5. Start the app with npm run dev.

Without environment credentials, public routes run in clearly marked sample-data mode. Protected partner and admin workflows show setup guidance instead of pretending to persist changes.

Configure Clerk's webhook endpoint as /api/webhooks/clerk and place its signing secret in CLERK_WEBHOOK_SIGNING_SECRET. Admin accounts are assigned only when their normalized email appears in ADMIN_EMAILS.

Set ORS_API_KEY to an OpenRouteService free-tier key to enable package route visualization. Without it, package pages retain their complete itinerary and show a safe route-unavailable state. Open-Meteo does not require a key. Weather badges are model-based travel-risk advisories and are never presented as confirmed road closures.

## Validation

- npm run typecheck
- npm test
- npx prisma validate
- npm run build

## Product boundaries

Bookings, checkout, payment, vouchers, reviews, Overpass safety data, AI planning, analytics, gamification, realtime tracking, and the native mobile app remain deferred according to the build plan.

See docs/GEOCODING_BACKLOG.md before adding any destination from the extended network.
