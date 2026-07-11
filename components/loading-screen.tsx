"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STATUS_MESSAGES = [
  "Loading mountain regions…",
  "Charting pickup routes…",
  "Checking weather advisories…",
  "Mapping safety points…",
];

const MOUNTAIN_PATH = "M8 52 L22 22 L30 36 L38 18 L56 52 Z";

export function LoadingScreen() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const path = root.querySelector<SVGPathElement>(".loader-mountain-path");
      const orbit = root.querySelector<HTMLSpanElement>(".loader-orbit");
      const ring = root.querySelector<HTMLSpanElement>(".loader-pulse-ring");
      const words = root.querySelectorAll<HTMLSpanElement>(".loader-word");
      const panel = root.querySelector<HTMLDivElement>(".loader-panel");
      const status = root.querySelector<HTMLParagraphElement>(".loader-status");

      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0.4 });
        gsap.to(path, { strokeDashoffset: 0, opacity: 1, duration: 1.8, ease: "power2.out", repeat: -1, repeatDelay: 0.6, yoyo: true });
      }

      if (orbit) {
        gsap.to(orbit, { rotation: 360, duration: 4.5, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      }

      if (ring) {
        gsap.fromTo(ring, { scale: 0.92, opacity: 0.35 }, { scale: 1.08, opacity: 0.85, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true });
      }

      if (panel) {
        gsap.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" });
      }

      if (words.length) {
        gsap.fromTo(words, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.15 });
      }

      if (status) {
        gsap.fromTo(status, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.45 });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className="loader-screen relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-white"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="loader-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(75,140,124,0.45)_0,transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(231,169,78,0.12)_0,transparent_35%)]" />

      <div className="loader-border-glow relative w-full max-w-md">
        <Card className="loader-panel relative z-10 border-white/15 bg-[rgba(12,41,35,0.72)] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <Badge className="border-accent/40 bg-accent/15 text-accent">Ghoomora</Badge>

          <div className="relative mx-auto mt-8 grid size-32 place-items-center">
            <span className="loader-pulse-ring absolute inset-0 rounded-full border border-[#4b8c7c]/40" />
            <span className="loader-orbit absolute inset-0">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(231,169,78,0.8)]"
                  style={{ transformOrigin: "50% 64px", transform: `rotate(${dot * 120}deg)` }}
                />
              ))}
            </span>
            <svg viewBox="0 0 64 64" className="relative size-16" fill="none" aria-hidden>
              <path
                className="loader-mountain-path"
                d={MOUNTAIN_PATH}
                stroke="#cbe4db"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path d={MOUNTAIN_PATH} fill="rgba(75,140,124,0.18)" stroke="none" />
            </svg>
          </div>

          <h1 className="display-title mt-8 text-3xl leading-tight text-white md:text-4xl">
            <span className="loader-word inline-block">Mapping</span>{" "}
            <span className="loader-word inline-block text-accent">the way</span>
          </h1>

          <p className="loader-status mt-3 text-sm text-white/65">{STATUS_MESSAGES[statusIndex]}</p>

          <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="loader-shimmer h-full w-1/2 rounded-full" />
          </div>
        </Card>
      </div>
    </main>
  );
}
