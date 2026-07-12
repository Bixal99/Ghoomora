# Adding real data to Ghoomora

Ghoomora no longer seeds catalog data. Regions, destinations, pickup cities, vendors, packages, and bookings come from real usage or manual entry.

## 1. Bootstrap the admin account

There is no admin sign-up route in the app. Create the first admin from the CLI:

1. Set in `.env`:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_NAME` (optional)
2. Ensure `DATABASE_URL` points at your Postgres database and migrations are applied (`npm run db:migrate`).
3. Run:

```powershell
npm run admin:create
```

The command is idempotent: if that email already exists, or a different admin already exists, it leaves the database untouched.

## 2. Add regions, destinations, and pickup cities

There is no admin CRUD UI for these tables yet. Use Prisma Studio against your local (or configured) database:

```powershell
npx prisma studio
```

### Region

| Field | Required | Notes |
|-------|----------|--------|
| `name` | yes | Display name |
| `slug` | yes | Unique URL slug (e.g. `gilgit-baltistan`) |
| `blurb` | no | Short marketing line for cards/pages. Leave empty rather than inventing generic copy — the UI omits empty blurbs |

### Destination

| Field | Required | Notes |
|-------|----------|--------|
| `regionId` | yes | Must reference an existing `Region.id` |
| `name`, `slug` | yes | `slug` unique |
| `latitude`, `longitude` | yes | Real coordinates |
| `elevationMeters` | yes | Integer meters |
| `bestSeasonStart`, `bestSeasonEnd` | yes | Month numbers 1–12 |
| `description` | yes | |
| `difficulty` | no | e.g. easy / moderate / hard |
| `requiresLocalTransport` | no | Default false |
| `localTransportNote` | no | Shown when local 4x4 is required |
| `heroImageUrl` | no | |

### PickupCity

| Field | Required | Notes |
|-------|----------|--------|
| `name`, `slug` | yes | Unique |

See [`docs/GEOCODING_BACKLOG.md`](GEOCODING_BACKLOG.md) before adding destinations outside verified coordinate sources.

## 3. Vendors, packages, and bookings

These are created only through the app:

1. A customer applies to become a vendor on `/profile`.
2. An admin approves the application on `/approvals`.
3. The vendor adds fleet / hotels / guides / camps and creates packages in the partner portal.
4. Travelers book verified packages through the public catalog and checkout.

No script creates fake vendors, packages, or bookings.
