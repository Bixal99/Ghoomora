"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ServicesTrailArt({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    const pin = pinRef.current;
    if (!path || !pin) return;

    const length = path.getTotalLength();

    if (reduced) {
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = "0";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(pin, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(path, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, 0);
      tl.to(pin, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 1.35);
      tl.to(pin, { y: -4, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 }, 1.8);
    }, rootRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none relative select-none", className)}
      aria-hidden
    >
      <svg viewBox="0 0 280 180" className="h-auto w-full max-w-sm overflow-visible" fill="none">
        <defs>
          <linearGradient id="services-sky" x1="40" y1="10" x2="240" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dce8e2" />
            <stop offset="1" stopColor="#f6f4ed" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="services-peak" x1="80" y1="40" x2="180" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2f6b5c" />
            <stop offset="1" stopColor="#153f34" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="42" r="48" fill="url(#services-sky)" />
        <circle cx="210" cy="42" r="6" fill="#f0b357" opacity="0.85" />

        <path d="M18 148 L78 72 L112 108 L148 48 L188 96 L232 64 L262 148 Z" fill="url(#services-peak)" opacity="0.92" />
        <path d="M48 148 L98 88 L128 118 L168 70 L208 110 L248 148 Z" fill="#1a4a3e" opacity="0.55" />
        <path d="M148 48 L162 68 L148 62 L134 72 Z" fill="#fffdf8" opacity="0.55" />

        <path d="M36 132 C 72 118 96 142 128 126 S 176 98 208 116 S 236 138 252 128" stroke="rgba(90,127,115,.3)" strokeWidth="2" strokeDasharray="3 8" strokeLinecap="round" />
        <path
          ref={pathRef}
          d="M36 132 C 72 118 96 142 128 126 S 176 98 208 116 S 236 138 252 128"
          stroke="#f0b357"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <g ref={pinRef}>
          <circle cx="252" cy="128" r="9" fill="#f0b357" />
          <circle cx="252" cy="128" r="4" fill="#fffdf8" />
          <path d="M252 118 L254.2 123.2 L260 123.6 L255.4 127 L256.8 132.6 L252 129.8 L247.2 132.6 L248.6 127 L244 123.6 L249.8 123.2 Z" fill="#153f34" />
        </g>
      </svg>
    </div>
  );
}
