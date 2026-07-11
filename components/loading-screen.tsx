"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GradientText } from "@/components/reactbits/gradient-text";

const STATUS_MESSAGES = [
  "Loading mountain regions…",
  "Charting pickup routes…",
  "Checking weather advisories…",
  "Mapping safety points…",
];

const ROUTE_PATH = "M 8 92 C 28 72 36 58 52 48 S 88 28 112 18";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LoadingScreen() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const routePathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const mountains = root.querySelectorAll<HTMLElement>(".loader-mountain");
      const orbs = root.querySelectorAll<HTMLElement>(".loader-orb");
      const grid = gridRef.current;
      const path = routePathRef.current;
      const progress = progressRef.current;

      if (mountains.length) {
        gsap.fromTo(
          mountains,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out" },
        );
      }

      if (grid) {
        gsap.to(grid, {
          backgroundPosition: "48px 48px",
          duration: 24,
          ease: "none",
          repeat: -1,
        });
      }

      orbs.forEach((orb, index) => {
        gsap.to(orb, {
          y: index % 2 === 0 ? 14 : -10,
          x: index % 2 === 0 ? 10 : -8,
          duration: 2.8 + index * 0.35,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.4,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 0.6,
          yoyo: true,
        });
      }

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 3.8, ease: "power1.inOut", repeat: -1, yoyo: true },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <main
      ref={rootRef}
      className="loader-screen relative min-h-screen overflow-hidden text-white"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div
        ref={gridRef}
        className="loader-topo-grid pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundPosition: "0 0" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(75,140,124,0.45)_0,transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(231,169,78,0.12)_0,transparent_35%)]" />

      <div className="loader-orb pointer-events-none absolute left-[13%] top-[19%] h-10 w-44 rounded-full bg-white/15 blur-2xl" />
      <div className="loader-orb pointer-events-none absolute right-[9%] top-[27%] h-14 w-60 rounded-full bg-white/10 blur-3xl" />
      <div className="loader-orb pointer-events-none absolute left-[42%] top-[12%] size-24 rounded-full bg-accent/20 blur-2xl" />
      <div className="loader-orb pointer-events-none absolute right-[28%] bottom-[38%] size-16 rounded-full bg-[#4b8c7c]/30 blur-xl" />

      <div className="loader-mountain pointer-events-none absolute inset-x-[-8%] bottom-[-7%] h-[56%] bg-[#244f43] opacity-70 [clip-path:polygon(0_72%,10%_42%,18%_65%,31%_24%,42%_62%,55%_35%,66%_58%,78%_18%,90%_56%,100%_38%,100%_100%,0_100%)]" />
      <div className="loader-mountain pointer-events-none absolute inset-x-[-8%] bottom-[-10%] h-[47%] bg-[#173f35] [clip-path:polygon(0_67%,13%_31%,24%_71%,38%_18%,52%_69%,65%_28%,76%_63%,88%_22%,100%_58%,100%_100%,0_100%)]" />
      <div className="loader-mountain pointer-events-none absolute inset-x-[-8%] bottom-[-13%] h-[35%] bg-[#0e2b24] [clip-path:polygon(0_52%,15%_25%,27%_66%,43%_10%,57%_62%,72%_20%,84%_66%,100%_30%,100%_100%,0_100%)]" />

      <div className="container-shell relative z-10 flex min-h-screen items-center pt-16 pb-24">
        <div className="max-w-2xl">
          <motion.p
            className="eyebrow mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-accent"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            Ghoomora
          </motion.p>

          <div className="mb-8 flex items-end gap-6">
            <svg viewBox="0 0 120 100" className="hidden size-28 shrink-0 sm:block" fill="none" aria-hidden>
              <path
                d={ROUTE_PATH}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 6"
              />
              <path
                ref={routePathRef}
                d={ROUTE_PATH}
                stroke="#e7a94e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="92" r="4" fill="#cbe4db" />
              <circle cx="112" cy="18" r="4" fill="#e7a94e" />
            </svg>

            <motion.h1
              className="display-title text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.88]"
              initial={reduced ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
              }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
                }}
              >
                Mapping
              </motion.span>{" "}
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
                }}
              >
                <GradientText className="italic">the way</GradientText>
              </motion.span>
            </motion.h1>
          </div>

          <div className="min-h-7 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                className="text-base text-white/70 md:text-lg"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                {STATUS_MESSAGES[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-10 max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/45">
              <span>Plotting route</span>
              <span className="text-accent">Northern Pakistan</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                ref={progressRef}
                className="loader-progress h-full w-full rounded-full bg-gradient-to-r from-[#4b8c7c] via-accent to-[#cbe4db]"
                style={reduced ? { transform: "scaleX(0.66)", transformOrigin: "left center" } : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
