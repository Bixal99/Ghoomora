# Ghoomora — Build Prompt

## Objective

Build **Ghoomora**, a multi-tenant SaaS tourism platform for Northern Pakistan. It combines trip discovery, multi-vendor booking (transport, hotels, guides, camps), route visualization, and safety information in one platform — closer to Airbnb + Booking.com + Komoot than a brochure site, scoped for a single developer to actually ship end to end.

Three roles share one schema: **Customer**, **Vendor** (typed: Transport / Hotel / Guide / Camp — one vendor account can hold more than one typed profile, e.g. a business running both jeeps and a guesthouse), and **Admin**.

Core user flow: browse Destinations (grouped by Region) → filter Packages by tier/budget/duration → pick a pickup city → Trip Builder or fixed Package → booking created against a `PackageTier` + day count + pickup city → vendor dashboard shows the booking against their inventory (Vehicle/Room/Guide) → admin approves vendors and monitors disputes/analytics across all regions.

Landing page: build an animated hero (mountains, clouds, birds, parallax) with GSAP + Three.js, styled after the Hilink project's landing page. Do not extend GSAP/Three.js usage past the landing page — everywhere else uses Framer Motion.

## Explicitly Out of Scope — do not build any of this

- Travel Journal (photo/drone upload pipeline) — disproportionate media infrastructure for what it adds
- Community/discussion forums
- Hiking Tracker — this is a native mobile app problem, not a web marketplace feature
- Local Marketplace (physical goods) — different business entirely: inventory, shipping, fulfillment
- Voice Assistant, Photo Caption Generator, Translation
- NestJS / Redis / BullMQ / MinIO — no separate backend service. Everything runs on Next.js App Router + Prisma/Postgres, with one exception below.
- The one approved exception: live trip tracking (Phase 6) needs Pusher's free tier for realtime, since Vercel serverless can't hold a persistent WebSocket connection. Do not build this before Phases 1–5 are stable, and do not fold it into the main Next.js deploy. Do not substitute a self-hosted Socket.io service on Railway — its free tier can no longer sustain even a lightweight always-on service, see Tech Stack.

## Tech Stack — use exactly this, do not substitute

| Layer | Requirement |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript. Confirm the exact current patch with `npm show next version` before scaffolding — 16.x ships patches frequently. |
| Styling / UI | Tailwind CSS + shadcn/ui for all components |
| Animation | Framer Motion app-wide; GSAP + Three.js on the landing page hero only |
| Maps & Routing | MapLibre GL + OpenStreetMap tiles + OpenRouteService (routing, elevation, multi-waypoint) |
| Charts | Chart.js or Recharts |
| ORM / DB | Prisma + PostgreSQL (Neon free tier) — do not use Railway for this; its free tier is now a 30-day $5 trial then ~$1/mo, not enough to run a database |
| Auth | Clerk |
| File storage | UploadThing or Cloudinary free tier |
| AI | Groq (Llama 3.x) or Gemini free tier — scoped only to itinerary generation and cost estimation, nothing else |
| Realtime | Pusher free tier — Phase 6 only, see Out of Scope. Do not deploy the Socket.io alternative on Railway; same free-tier problem as the database row above |
| PDF | @react-pdf/renderer |
| Safety data | OSM Overpass API — no manual data entry for hospitals/checkpoints/fuel |
| Deployment | Vercel (web) + Neon (DB) + Pusher (realtime, Phase 6 only) — no Railway anywhere in the stack |

Everything above must stay on a free tier. Flag before adding any paid service.

## Transport Model — read carefully, this is easy to get wrong

Two independent layers. Do not collapse them into a single vehicle-type field.

**Layer 1 — pickup leg** (origin city → destination region). Exactly three booking options, each just a (vehicle type, mode) pair:
1. Bus with group — `COASTER` + `SHARED` — priced per seat
2. Private bus — `COASTER` + `PRIVATE` — priced as one lump sum for the vehicle
3. Private car — `CAR` + `PRIVATE` — priced as one lump sum for the vehicle

Price varies by pickup city (Lahore, Islamabad, Multan, Gujranwala, and others — an open, growable list, not a fixed enum) crossed with destination region. Store this as a fare table (`VehicleFare`), never as a flat price on the vehicle itself.

**Layer 2 — local day-hire.** Independent of Layer 1, not tied to tier. Certain destinations (Fairy Meadows, Deosai, and others — see the jeep-track list in the Destination Data section) require a `WAGON`, `LAND_CRUISER`, `PRADO`, or `JEEP` hired locally for the day, arranged on-site. Bill this as its own line item on top of whatever pickup option was chosen, only when the itinerary touches a destination flagged `requiresLocalTransport = true`.

**Tier mapping** — tiers map onto Layer 1 only:

| Tier | Pickup leg | Accommodation | Extras |
|---|---|---|---|
| Standard | Bus with group | Budget hotel/guesthouse | Self-guided; local day-hire billed separately if needed |
| Moderate | Private car | Mid-tier hotel | Optional guide add-on; local day-hire billed separately if needed |
| Luxury | Private bus or private car | Luxury hotel/resort | Dedicated guide + photographer; local day-hire usually bundled in |

Day count is a range per package (`minDays`–`maxDays`), not fixed — price scales per extra day, selected live on the package page alongside pickup city and tier.

Implement this price formula server-side:

```
Booking.totalPrice =
    pickupFare(vehicleType, transportMode, pickupCity, region)
  + tier.pricePerPersonPerDay * selectedDays * travelerCount
  + Σ localHireRate.pricePerDay   // for each destination in the itinerary where requiresLocalTransport = true
```

Validate `selectedDays` against `Package.minDays`/`maxDays` server-side before checkout. If any `PackageStop.destination.requiresLocalTransport` is true for the chosen package, checkout must resolve a `LocalHireRate` for it before completing — either bundled at Luxury tier or added as a separate line item at Standard/Moderate. The PDF voucher must itemize pickup fare, accommodation, and any local day-hire as separate lines — never bundle them into one number.

## Database Schema — implement this Prisma schema exactly

```prisma
model Region {
  id           String        @id @default(cuid())
  name         String
  slug         String        @unique
  destinations Destination[]
  fares        VehicleFare[]
}

model Destination {
  id                     String          @id @default(cuid())
  regionId               String
  region                 Region          @relation(fields: [regionId], references: [id])
  name                   String
  slug                   String          @unique
  latitude               Float
  longitude              Float
  elevationMeters        Int
  bestSeasonStart        Int
  bestSeasonEnd          Int
  difficulty             String?         // easy / moderate / hard — for map hover state
  description            String
  heroImageUrl            String?
  requiresLocalTransport Boolean         @default(false) // true for Fairy Meadows, Deosai, etc. — generic flag, not a hardcoded name list, so any current/future rough-terrain spot can be flagged without a code change
  localTransportNote     String?         // e.g. "4x4 required from Raikot Bridge"
  packageStops           PackageStop[]
  hotels                 Hotel[]
  safetyPoints           SafetyPoint[]
  localHireRates         LocalHireRate[]
}

enum Role { CUSTOMER VENDOR ADMIN }
enum VendorType { TRANSPORT HOTEL GUIDE CAMP }

model User {
  id       String    @id @default(cuid())
  clerkId  String    @unique
  role     Role      @default(CUSTOMER)
  name     String
  email    String    @unique
  phone    String?
  vendor   Vendor?
  bookings Booking[]
  reviews  Review[]
}

model Vendor {
  id           String        @id @default(cuid())
  ownerId      String        @unique
  owner        User          @relation(fields: [ownerId], references: [id])
  businessName String
  types        VendorType[]
  verified     Boolean       @default(false)
  contactPhone String
  description  String?
  vehicles     Vehicle[]
  hotels       Hotel[]
  guideProfile GuideProfile?
  campSites    CampSite[]
  packages     Package[]
}

enum VehicleType { WAGON COASTER CAR LAND_CRUISER PRADO JEEP }
enum TransportMode { SHARED PRIVATE }

model PickupCity {
  id       String        @id @default(cuid())
  name     String        @unique // Lahore, Islamabad, Multan, Gujranwala, Rawalpindi... open list, add more anytime
  slug     String        @unique
  fares    VehicleFare[]
  bookings Booking[]
}

model Vehicle {
  id             String          @id @default(cuid())
  vendorId       String
  vendor         Vendor          @relation(fields: [vendorId], references: [id])
  type           VehicleType
  seats          Int
  ac             Boolean
  fares          VehicleFare[]   // pickup leg — bus with group / private bus / private car, priced by pickup city + region
  localHireRates LocalHireRate[] // local day-hire at rough-terrain destinations, priced by destination, per day
}

// Pickup leg fare. The 3 options are (vehicle type, mode) combinations:
// COASTER + SHARED = bus with group, COASTER + PRIVATE = private bus, CAR + PRIVATE = private car.
// The same coaster fleet can be listed under both modes at different prices.
model VehicleFare {
  id           String        @id @default(cuid())
  vehicleId    String
  vehicle      Vehicle       @relation(fields: [vehicleId], references: [id])
  mode         TransportMode
  pickupCityId String
  pickupCity   PickupCity    @relation(fields: [pickupCityId], references: [id])
  regionId     String
  region       Region        @relation(fields: [regionId], references: [id])
  price        Int           // per-seat if mode = SHARED, whole-vehicle lump sum if PRIVATE

  @@unique([vehicleId, pickupCityId, regionId, mode])
}

// Local day-hire. Wagon/Land Cruiser/Prado/Jeep booked for the day at a specific
// rough-terrain destination. Independent of however the traveler got to the region.
model LocalHireRate {
  id            String      @id @default(cuid())
  vehicleId     String
  vehicle       Vehicle     @relation(fields: [vehicleId], references: [id])
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  pricePerDay   Int

  @@unique([vehicleId, destinationId])
}

enum HotelTier { BUDGET MID LUXURY }

model Hotel {
  id            String      @id @default(cuid())
  vendorId      String
  vendor        Vendor      @relation(fields: [vendorId], references: [id])
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  name          String
  tier          HotelTier
  rooms         Room[]
}

model Room {
  id            String  @id @default(cuid())
  hotelId       String
  hotel         Hotel   @relation(fields: [hotelId], references: [id])
  type          String
  capacity      Int
  pricePerNight Int
  available     Boolean @default(true)
}

model GuideProfile {
  id              String   @id @default(cuid())
  vendorId        String   @unique
  vendor          Vendor   @relation(fields: [vendorId], references: [id])
  languages       String[]
  yearsExperience Int
  dailyRate       Int
  certified       Boolean  @default(false)
}

model CampSite {
  id            String @id @default(cuid())
  vendorId      String
  vendor        Vendor @relation(fields: [vendorId], references: [id])
  name          String
  amenities     String[]
  capacityTents Int
  pricePerNight Int
}

enum TierLevel { STANDARD MODERATE LUXURY }

model Package {
  id            String        @id @default(cuid())
  vendorId      String
  vendor        Vendor        @relation(fields: [vendorId], references: [id])
  title         String
  description   String
  minDays       Int
  maxDays       Int
  stops         PackageStop[]
  tiers         PackageTier[]
  bookings      Booking[]
}

model PackageTier {
  id                   String        @id @default(cuid())
  packageId            String
  package              Package       @relation(fields: [packageId], references: [id])
  tier                 TierLevel
  vehicleType          VehicleType   // which pickup vehicle this tier defaults to — COASTER (Standard/Luxury) or CAR (Moderate)
  transportMode        TransportMode // SHARED = bus with group, PRIVATE = private bus/private car
  pricePerPersonPerDay Int           // accommodation + extras only — pickup transport priced separately via VehicleFare
  hotelTier            HotelTier
  includesGuide        Boolean       @default(false)
  bookings             Booking[]
}

model PackageStop {
  id            String      @id @default(cuid())
  packageId     String
  package       Package     @relation(fields: [packageId], references: [id])
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  dayNumber     Int
  stopType      String      // "overnight" | "meal" | "fuel" | "prayer" | "viewpoint"
  hotelId       String?
}

enum BookingStatus { PENDING CONFIRMED IN_PROGRESS COMPLETED CANCELLED }

model Booking {
  id            String        @id @default(cuid())
  customerId    String
  customer      User          @relation(fields: [customerId], references: [id])
  packageId     String
  package       Package       @relation(fields: [packageId], references: [id])
  tierId        String
  tier          PackageTier   @relation(fields: [tierId], references: [id])
  pickupCityId  String
  pickupCity    PickupCity    @relation(fields: [pickupCityId], references: [id])
  selectedDays  Int
  travelDate    DateTime
  status        BookingStatus @default(PENDING)
  totalPrice    Int
  travelers     Traveler[]
  review        Review?
}

model Traveler {
  id        String  @id @default(cuid())
  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id])
  name      String
  idNumber  String?
  phone     String?
}

model Review {
  id        String  @id @default(cuid())
  bookingId String  @unique
  booking   Booking @relation(fields: [bookingId], references: [id])
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  rating    Int
  comment   String?
}

model SafetyPoint {
  id            String @id @default(cuid())
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  type          String // "hospital" | "police" | "checkpoint" | "petrol" | "mechanic"
  name          String
  latitude      Float
  longitude     Float
  phone         String?
}
```

## Destination Data — seed exactly these for Phase 1

Every destination-facing query must join through `Region` — never hardcode a destination list in a component. Coordinates/elevations below are approximate reference values; Naltar, Saiful Malook, Chocolate Rocks, Ratti Gali, and Sheosar Lake were verified against current sources, the Neelum Valley chain (Kel, Arang Kel, Taobat, Shounter) are rougher estimates and need a map check before production.

### Gilgit-Baltistan

**Hunza–Nagar cluster**

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Hunza Valley (Karimabad) | 36.3167 | 74.6500 | 2,438 |
| Baltit Fort | 36.3184 | 74.6570 | 2,500 |
| Altit Fort | 36.2975 | 74.6612 | 2,400 |
| Rakaposhi View Point | 36.2333 | 74.5833 | 2,300 |
| Attabad Lake | 36.3654 | 74.8666 | 2,560 |
| Passu (Passu Cones) | 36.4500 | 74.8833 | 2,400 |
| Borith Lake | 36.4667 | 74.8833 | 2,600 |
| Hoper Glacier | 36.2333 | 74.7333 | 2,700 |
| Naltar Valley | 36.1617 | 74.1819 | 2,900 |
| Khunjerab Pass | 36.8500 | 75.4167 | 4,693 |

**Skardu–Baltistan cluster**

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Skardu | 35.2971 | 75.6333 | 2,228 |
| Shigar Valley | 35.4167 | 75.7333 | 2,438 |
| Khaplu | 35.1667 | 76.3333 | 2,600 |
| Chocolate Rocks (Sermik, near Chhomdu Bridge) | 35.1500 | 75.5500 | 2,200 |

**Astore–Deosai cluster**

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Astore | 35.3667 | 74.8500 | 2,600 |
| Minimarg | 35.0500 | 74.8500 | 3,100 |
| Rama Meadows | 35.3167 | 74.8333 | 3,300 |
| Fairy Meadows | 35.3853 | 74.5622 | 3,300 |
| Deosai National Park / Sheosar Lake | 35.0333 | 75.4167 | 4,250 |
| Chilas | 35.4222 | 74.1000 | 1,250 |

**Ghizer cluster**

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Gilgit (city) | 35.9000 | 74.3000 | 1,500 |
| Phander Valley | 36.0500 | 72.5667 | 2,900 |
| Shandur Pass | 36.0833 | 72.5333 | 3,738 |

### KPK Northern Areas

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Naran | 34.9042 | 73.6500 | 2,409 |
| Saif-ul-Malook Lake | 34.8830 | 73.6870 | 3,224 |
| Kaghan | 34.7830 | 73.5500 | 2,103 |
| Shogran | 34.7333 | 73.4833 | 2,362 |
| Kumrat Valley | 35.4833 | 72.0333 | 2,803 |
| Swat (Mingora) | 35.4855 | 72.5789 | 980 |
| Kalam | 35.4667 | 72.5833 | 2,000 |
| Chitral | 35.8518 | 71.7864 | 1,500 |

### Azad Jammu & Kashmir

| Destination | Lat | Lng | Elevation (m) |
|---|---|---|---|
| Neelum Valley (Sharda) | 34.7967 | 74.1922 | 1,981 |
| Kel | 34.6200 | 73.9300 | 2,020 |
| Arang Kel | 34.6300 | 73.9200 | 2,449 |
| Taobat | 34.7500 | 73.8500 | 2,100 |
| Shounter Valley | 34.8000 | 73.8000 | 3,400 |
| Ratti Gali Lake | 34.7500 | 74.0000 | 3,700 |
| Rawalakot | 33.8570 | 73.7649 | 1,677 |
| Banjosa Lake | 33.7667 | 73.7500 | 1,981 |
| Pir Chinasi | 34.4200 | 73.4667 | 2,900 |
| Muzaffarabad | 34.3700 | 73.4711 | 702 |

### Extended network — additional valleys to seed after the above

Sourced from the *Tourist Guide Map — Northern Pakistan (Travel Times from HMC Tours)*, a schematic transit-style map (relative connections and times, not to scale). Names only — geocode each before seeding, do not invent coordinates. Double-check spelling against a second source (a few labels on the source map are close variants of each other, e.g. "Kandol" vs a similar-looking nearby label, "Batakundi" vs "Battakundi"), and drop anything that's really a road junction rather than a destination worth its own page.

| Region | Key stops |
|---|---|
| Ishkoman Valley | Naltar Lake, Chalt, Ghulmet |
| Ghizer Valley (expanded) | Broghil, Kromber Lake, Booni, Mastuj, Yasin, Gupis, Gahkuch, Singul |
| Kailash Valley (Chitral) | Rambor, Ayun, Ayun Mor, Bumboret, Drosh, Lowari Top |
| Kalam Valley (expanded) | Shahzor Lake, Kandol Lake, Mahodand Lake, Falak Sar (peak), Mitaltan, Utror, Gabral, Badgoi, Bahrain, Madian |
| Kumrat Valley (expanded) | Dir, Thal, Patrack, Sharingal, Chukyatan, Darora, Khaal, Rabat, Timargara, Talaash, Chakdara |
| Swat Valley (expanded) | Miandam, Matta, Shangla Pass, Khawazakhela, Alpuri, Malamjabba, Besham, Barikot, Malakand |
| Allai Valley | Jijal, Dasu, Komila, Pattan, Baisal, Gitti Das, Battagram, Gallai Meadows, Thakot |
| Kaghan Valley (expanded) | Balakot, Jalkhad, Batakundi, Ansu Lake, Lalazar, Lulusar, Dudipatsar, Manoor, Mahandari, Manor Bela, Sharan, Paras, Kawai, Makra Peak |
| Neelum Valley (expanded) | Kundal Shahi, Dowarian, Halmat, Karimabad (Neelum side), Sardari, Athmuqam, Keran, Jagran, Kutton, Upper Neelum |
| Jhelum Valley | Chinari, Chakothi, Hattian Bala, Leepa, Reshian Top, Chakar, Kohala |
| Siran Valley | Ghari Habibullah, Shinkiyari, Bissian, Oghi, Khaki, Thandiani, Nathiagali, Ayubia |
| Astore–Deosai (expanded) | Jaglot, Raikot Bridge, Tatu, Beyal Camp, Rupal, Tarshing, Gorikot, Dus Kharam, Sadpara Lake, Bara Pani, Burzil, Chitta Katha Lake, Rainbow Lake |
| Skardu–Baltistan (expanded) | Sassi, Shengus, Sattak Nala, Sarfaranga, Kachura, Shangrila |
| Southern gateway cities | Peshawar, Charsadda, Mardan, Swabi, Haripur, Havelian, Abbottabad, Murree, Taxila, Hassanabdal, Islamabad, Rawalpindi |
| AJK southern belt | Bagh, Sudhangali, Ganga Choti, Zalzaal Lake, Tolipir, Kotli, Pallandri, Hajeera, Tatta Pani, Sehnsa, Mangla, Mirpur, Bhimber, Bagsar Lake |

**Set `requiresLocalTransport = true` on these** (jeep-track icon on the source map, strongest signal available for this flag), in addition to Fairy Meadows and Deosai: Naltar Lake (upper valley), Rama Lake / Rupal / Tarshing (Astore side), Bara Pani / Sadpara Lake / Burzil (Deosai approach), Ratti Gali Lake (Dowarian side), Chitta Katha Lake / Rainbow Lake / Karimabad (Neelum side) / Minimarg, Saif-ul-Malook Lake / Ansu Lake / Lulusar / Dudipatsar (upper Kaghan), Gallai Meadows, Zalzaal Lake, Tolipir, Ganga Choti, Bagsar Lake. This list is read off a dense infographic, not a verified GPS survey — flag it for a manual sanity check before treating it as ground truth; a wrong flag in either direction (customer sent to a "self-guided" tier on a road that actually needs a 4x4, or charged for a hire they didn't need) directly damages trust in the booking flow.

## Build Order — follow this sequence, do not skip ahead

**Phase 1 — Foundation.** Schema + seed (all destination data above, plus pickup cities and `requiresLocalTransport` flags), auth/roles, base layouts. Do not start Phase 3 UI before this is fully done — the map and route engine depend on real coordinates existing in the DB.

**Phase 2 — Vendor & packages.** Vendor onboarding for all 4 typed profiles (Transport, Hotel, Guide, Camp), including pickup-leg fares (by pickup city) and local day-hire rates (by destination) for transport vendors. Package CRUD with the 3-tier + day-range model.

**Phase 3 — Customer discovery.** Browse/filter with pickup city selection, Trip Builder (destinations, dates, party size, tier preference, pickup city), MapLibre destination map with hover states (weather, altitude, difficulty, road status).

**Phase 4 — Route visualization.** ORS routing, animated marker along the route, waypoint badges, elevation profile, stop-type tagging (hotel/restaurant/fuel/prayer/viewpoint). Weather Intelligence: forecast + basic road-closure flag per destination (Open-Meteo).

**Phase 5 — Booking & safety.** Booking, checkout, itemized PDF e-voucher, booking status pipeline, Safety Dashboard (Overpass API — hospitals/police/checkpoints/fuel/mechanic, no manual data entry), reviews tied to completed bookings only.

**Phase 6 — AI & polish.** AI Trip Planner (budget + days + interests → suggested `PackageStop` sequence, Groq/Gemini), AI Cost Estimator (fuel + lodging + food estimate for a custom trip), admin analytics dashboard (bookings by region, revenue, popular destinations), gamification (traveler levels Explorer → Mountain Goat → Legend based on completed-trip count, plus a handful of badges), live trip tracking via Pusher's free tier — see Out of Scope exception above. Do not start this until Phases 1–5 are stable; it's a managed third-party service integrated via API, not a Next.js API route.

## Folder Structure — follow exactly

```
ghoomora/
├── app/
│   ├── (customer)/
│   │   ├── page.tsx                 # landing (GSAP hero)
│   │   ├── regions/[slug]/
│   │   ├── destinations/[slug]/
│   │   ├── packages/[id]/           # pickup city + tier + day selector, route preview
│   │   ├── trip-builder/
│   │   └── checkout/
│   ├── (vendor)/
│   │   ├── dashboard/
│   │   ├── fleet/
│   │   ├── hotels/
│   │   ├── guide-profile/
│   │   ├── camps/
│   │   └── packages/
│   ├── (admin)/
│   │   ├── approvals/
│   │   └── analytics/
│   └── api/
│       ├── route/                   # OpenRouteService proxy
│       ├── ai-planner/
│       ├── safety/                  # Overpass proxy
│       └── webhooks/
├── components/
│   ├── ui/
│   ├── map/                         # RouteMap, AnimatedMarker, ElevationChart
│   ├── destination/
│   └── package/                     # TierSelector, DaySlider, PickupCitySelector
├── lib/
│   ├── prisma.ts
│   ├── ors.ts                       # OpenRouteService helper
│   ├── overpass.ts
│   ├── pricing.ts                   # resolves Booking.totalPrice: pickup fare + tier price + local day-hire
│   └── ai.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

## Rules — follow strictly, no exceptions

1. Next.js App Router, TypeScript strict mode. Use Server Actions everywhere except the ORS/Overpass proxies and webhooks.
2. All UI components come from shadcn/ui.
3. Every destination-facing query joins through `Region` — never hardcode a destination list in a component.
4. Never flatten pickup-leg transport (Layer 1) and local day-hire transport (Layer 2) into a single price field. They are priced and stored separately even when a tier bundles them into one customer-facing total. See the Transport Model section.
5. Do not invent lat/lng coordinates for any destination not already verified in the Destination Data section — leave a TODO and flag it for manual geocoding instead.
6. Stay on free-tier services only (see Tech Stack). Flag before adding anything paid.
7. Do not build anything listed under Explicitly Out of Scope, even if it would be a natural extension of a feature you're already building.
8. Do not start live-tracking (Pusher integration) before Phases 1–5 are stable. Do not self-host a Socket.io alternative on Railway — see Tech Stack.
