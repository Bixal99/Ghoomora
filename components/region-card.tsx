"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { getRegionImage } from "@/lib/region-images";

const PANEL_COLORS = ["#153f34", "#294b61", "#755136"] as const;

type RegionCardProps = {
  region: {
    slug: string;
    name: string;
    blurb: string | null;
    destinations: { id: string }[];
  };
  index: number;
};

export function RegionCard({ region, index }: RegionCardProps) {
  const image = getRegionImage(region.slug);
  const panel = PANEL_COLORS[index % PANEL_COLORS.length];

  return (
    <Link
      href={"/regions/" + region.slug}
      className="focus-ring group relative flex h-full min-h-80 cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white/10 text-white shadow-[0_20px_55px_rgba(16,40,32,.13)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(16,40,32,.2)]"
      style={{ backgroundColor: panel }}
    >
      {image ? (
        <div className="relative h-[55%] min-h-40 overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: `linear-gradient(to top, ${panel}, transparent)` }}
            aria-hidden
          />
        </div>
      ) : (
        <div className="px-7 pt-7">
          <span className="grid size-12 place-items-center rounded-full bg-white/12">
            <Compass />
          </span>
        </div>
      )}

      <div className={"relative flex flex-1 flex-col p-7 " + (image ? "pt-2" : "pt-16")}>
        {image ? (
          <span className="mb-4 grid size-11 place-items-center rounded-full bg-white/12 backdrop-blur-sm">
            <Compass size={20} />
          </span>
        ) : null}
        <p className="text-sm text-white/55">{region.destinations.length} destinations</p>
        <h3 className="display-title mt-2 text-4xl">{region.name}</h3>
        {region.blurb ? (
          <p className="mt-3 flex-1 text-sm leading-6 text-white/72">{region.blurb}</p>
        ) : (
          <span className="flex-1" />
        )}
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-accent">
          Explore region
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </span>
        <svg
          className="mt-3 h-3 w-24 overflow-visible opacity-0 transition duration-300 group-hover:opacity-100"
          viewBox="0 0 96 12"
          fill="none"
          aria-hidden
        >
          <path
            d="M 2 8 C 18 2 28 10 44 6 S 72 2 94 7"
            stroke="#f0b357"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Link>
  );
}
