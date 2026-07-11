# Extended destination geocoding backlog

The extended network listed in Build.md is intentionally not fully seeded yet. Its coordinates must be checked against a second reliable map source before insertion.

## Partially seeded (verified coordinates)

Southern gateway and upper Kaghan additions are now in `prisma/seed-data.ts`:

- Peshawar, Abbottabad, Murree, Nathiagali, Taxila, Balakot
- Lulusar Lake, Babusar Pass

## Still pending manual geocoding

All remaining valleys and stops from Build.md's extended network (Ishkoman, Broghil, Kalam expanded, Kumrat expanded, Neelum expanded, AJK southern belt, etc.) must be geocoded before seeding. Do not add placeholder coordinates.

Incorrect `requiresLocalTransport` flags or routing points can create unsafe customer expectations.
