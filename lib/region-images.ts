export const REGION_IMAGES: Record<string, string> = {
  "gilgit-baltistan": "/gilgit.png",
  "kpk-northern-areas": "/kpk.png",
  "azad-jammu-kashmir": "/Azad_kashmir.jpg",
};

export function getRegionImage(slug: string): string | null {
  return REGION_IMAGES[slug] ?? null;
}
