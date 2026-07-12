# Landing hero + regions polish

**Date:** 2026-07-12  
**Status:** Approved for planning  
**Scope:** Guest landing (`app/page.tsx`) only — hero headline motion and regions section visual polish.

## Goals

1. Make the hero headline slightly smaller and more memorable with a partial golden typewriter.
2. Fill the empty mid-gap in the regions section header with an animated route ribbon.
3. Turn solid-color region cards into photo-backed cards with refined hover motion and clear pointer affordance.

## Non-goals

- Traveler home / Profile quick-action cards.
- New region data model or CMS image fields (use static `public/` assets mapped by slug).
- Replacing the existing Three.js `HeroScene`.

## Hero

### Typography scale

- Reduce display size from current `clamp(3.35rem, 9.2vw, 7.75rem)` to roughly `clamp(2.6rem, 6.5vw, 5.5rem)` so the first viewport feels less cramped and more balanced with the subcopy and CTA.

### Typewriter

- Static (white): `Go beyond the `
- Typed (accent / `#f0b357`): `postcard.`
- Soft blinking caret while typing; hide caret when complete (or leave a brief pause then hide).
- Loop once on mount (no endless retype unless reduced-motion users never see typing).
- `prefers-reduced-motion: reduce`: render the full headline immediately with no caret animation.

### Implementation notes

- Client component for the headline only (e.g. `HeroTypewriter`), keep the rest of the page as a server component.
- Prefer a small GSAP or lightweight `requestAnimationFrame`/interval typewriter; GSAP is already used on the landing via `HeroScene` / loading screen.

## Regions header — route ribbon

### Placement

- Desktop (`lg+`): three-column header `lg:grid-cols-[1fr_minmax(10rem,16rem)_1fr]` — title left, route ribbon center, blurb right — so the empty mid-gap is filled.
- Mobile: short decorative strip under the title (stacked; not a side gap).

### Motion

- SVG dashed trail path draws on scroll into view (or on mount when visible).
- Small pin/dot travels along the path once.
- Accent stroke uses brand gold sparingly; path body uses muted green (`#5a7f73` / primary tints).
- `prefers-reduced-motion: reduce`: path fully drawn, pin static at end.

## Region cards

### Imagery (partial, not full-bleed cover)

Map by region slug:

| Slug | Asset |
|------|--------|
| `gilgit-baltistan` | `/gilgit.png` |
| `kpk-northern-areas` | `/kpk.png` |
| `azad-jammu-kashmir` | `/Azad_kashmir.jpg` |

- Photo occupies roughly the top ~55% of the card.
- Soft gradient fade from photo into the existing brand panel colors (green / navy / brown by index or slug).
- Text (destinations count, name, blurb, CTA) remains on the lower solid/gradient area for contrast.
- Fallback: if slug has no mapped image, keep current solid-color card treatment.

### Hover + cursor

- Lift (`translateY`), stronger shadow, slight photo scale (~1.04–1.06).
- Optional short dashed route line draw near the CTA or across the photo edge.
- `cursor: pointer` on the card link (custom trail cursor only if it stays lightweight and does not hurt accessibility).

### Accessibility

- Images are decorative context for the region name → empty `alt` or meaningful `alt` matching region name; link text remains the region name / “Explore region”.
- Focus-visible ring retained via existing `focus-ring`.

## Components / files (expected)

- `components/hero-typewriter.tsx` — client typewriter headline.
- `components/route-ribbon.tsx` — client SVG route animation for regions header.
- `components/region-card.tsx` (or inline refactor in `app/page.tsx`) — photo-backed region card.
- `app/page.tsx` — wire components; smaller hero title usage.
- Optional: small helper `lib/region-images.ts` for slug → image map.

## Success criteria

- Hero reads clearly with static white prefix + golden typed suffix; size feels smaller than before.
- Regions header gap no longer feels empty on desktop; route ribbon is visible and intentional.
- Three region cards show the mapped photos partially, with readable text and a polished hover.
- Reduced-motion users get complete content without typing/travel animations.
