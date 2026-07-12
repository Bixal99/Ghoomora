# Retire Seed System — Real-Data-Only Workflow (Part 5)

**Date:** 2026-07-12  
**Status:** Implemented

## Objective

Remove the seed system as a source of application data. Regions, destinations, pickup cities, vendors, packages, and bookings come only from real usage or manual entry (Prisma Studio). The sole bootstrap remaining is creating the initial admin account via a dedicated script (not framed as seeding).

## Ground rules

- No hardcoded credentials, connection strings, or ports.
- No duplicated literals where a shared source of truth belongs.
- All DB access via existing Prisma / `DATABASE_URL` path (`resolvePgConnectionString` where scripts connect).
- Do **not** delete existing rows already in local or production databases (except the intentional one-time blurb `UPDATE`s below).

## Inspection findings (pre-removal)

| Area | Finding |
|------|---------|
| Tests | None of the current ~50 tests query `Region` / `Destination` / `PickupCity` or assume seeded rows. No test-seed helper required for Part 5. |
| Auto-seed | No `postinstall`. Seed is wired via `package.json` `db:seed` / `prisma.seed`, and `prisma.config.ts` `migrations.seed`. |
| Cleanup | `scripts/cleanup-seed-artifacts.ts` only removes historical fake-vendor artifacts; remove with the seed system. |
| Hidden dependency | `lib/data.ts` imports `prisma/seed-data` for runtime demo fallbacks and region blurbs (`Region` has no `blurb` column today). |

## Approach

**Full retirement + schema blurb + layered public catalog states** (Approach 2).

Not in scope: keeping renamed demo catalogs; building admin CRUD for catalog tables.

---

## Data layer and schema

### Remove

- `prisma/seed.ts`
- `prisma/seed-data.ts`
- `prisma/seed-artifacts.ts`
- `scripts/cleanup-seed-artifacts.ts`
- `package.json` scripts: `db:seed`, `db:cleanup-seed`, and `prisma.seed`
- `prisma.config.ts` `migrations.seed` entry

After removal, grep must show no remaining references to those files or scripts.

### `Region.blurb` migration (one-time transition)

- Add nullable `blurb String?` on `Region` (migration must not fail against existing rows).
- Same migration: slug-guarded `UPDATE`s for:
  - `gilgit-baltistan` → `"Glacial valleys, high passes and the great Karakoram."`
  - `kpk-northern-areas` → `"Forest valleys, alpine lakes and welcoming mountain towns."`
  - `azad-jammu-kashmir` → `"River valleys, green ridgelines and remote lake country."`
- Updates no-op safely if those rows are absent.
- **Not a template for future content edits.** Later blurb changes and any 4th region go through Prisma Studio, not new data migrations.
- **No in-code fallback string** when `blurb` is null/empty — UI omits the blurb element.

### Rewrite `lib/data.ts`

- Drop imports from seed-data / seed-artifacts.
- Drop `fallbackRegions` / `fallbackPackages` / sample tiers.
- Healthy DB, empty tables → return `[]`.
- Missing DB / missing schema → **setup-unavailable** signal (not fake rows); pages branch to setup guidance.
- Healthy DB with rows → map `region.blurb` from the column.

---

## Admin bootstrap

- New script: `scripts/create-admin.ts`
- npm script: `admin:create`
- Connection pattern: Pool + `resolvePgConnectionString(process.env.DATABASE_URL)` + Prisma adapter (same as former seed).
- Env: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — never hardcoded.
- Idempotent behavior:
  - If a user with `ADMIN_EMAIL` already exists → leave untouched (or log “already present”).
  - If a *different* `Role.ADMIN` already exists → log and exit without creating a second admin.
  - Otherwise create the admin user.
- Does nothing else (no regions, destinations, pickup cities, vendors, packages).
- `.env.example` documents this as admin bootstrap via `npm run admin:create`, not “seeding.”

This is the only bootstrap concept left in the codebase after Part 5.

---

## Public UI states

| Condition | UI |
|-----------|-----|
| No DB / `getDb()` null / missing-schema (P2021 etc.) | Setup guidance (same family as unconfigured `AccessPanel`): connect database, migrate, `admin:create`, link to `docs/ADDING_REAL_DATA.md`. Not “demo mode” / “run seed.” |
| DB healthy, zero catalog rows | Existing `EmptyState` component — “no content yet” / how to add data. |
| DB healthy, rows present | Current listing UI; show blurb only when non-empty. |

### Copy updates

- `components/access-panel.tsx`: remove “demo mode” and “run … seed.”
- Public catalog pages (home, packages, trip-builder, region/destination as needed): branch setup vs empty vs content consistently (thin shared setup card or AccessPanel-style Card — one visual language).

---

## Documentation

### New: `docs/ADDING_REAL_DATA.md`

1. Bootstrap admin — `ADMIN_*` env + `npm run admin:create`.
2. Add Region / Destination / PickupCity via Prisma Studio (`npx prisma studio`) — required fields and relations (`Destination.regionId`, etc.), including `Region.blurb`.
3. Vendors, packages, bookings — created only through real app flows (vendor application → admin approval → inventory → packages → bookings).

### Update

- `README.md`: replace `db:seed` with `admin:create`; remove “sample-data mode”; point to `ADDING_REAL_DATA.md`; fix scripts table / tree.
- `.env.example`: admin bootstrap wording.
- `docs/GEOCODING_BACKLOG.md`: stop pointing at `seed-data.ts`; point at Studio + `ADDING_REAL_DATA.md`.
- `Build.md`: do not instruct running a seed script (historical destination lists may remain as research notes).

---

## Tests

- No ambient dependence on a shared seeded database.
- Part 5 does not require new DB fixtures unless a new data-layer test is added; if so, insert rows in that test’s own setup/teardown only — never revive a seed script for tests.

---

## Out of scope

- Admin CRUD UI for regions / destinations / pickup cities.
- Changes to VendorApplication, auth/session, or Parts 1–4 progressive-disclosure UX.
- Deleting or re-creating existing catalog rows (beyond the one-time blurb `UPDATE`s).

---

## Deliverables / verification

- Every removed file confirmed unreferenced.
- `scripts/create-admin.ts` + `npm run admin:create`.
- Test inspection result documented (no seeded-row dependency found).
- `docs/ADDING_REAL_DATA.md` present.
- Existing regions/destinations/pickup cities untouched except blurb backfill.
- `npm run typecheck && npm test && npm run build` pass.
