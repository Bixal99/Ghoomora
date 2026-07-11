"use client";

import { motion, useReducedMotion } from "framer-motion";

const orbitDots = [0, 1, 2];

export function MountainLoader({ label = "Mapping the way" }: { label?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative grid size-24 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/15"
          animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-0"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        >
          {orbitDots.map((dot) => (
            <span
              key={dot}
              className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-accent"
              style={{ transformOrigin: "50% 48px", transform: `rotate(${dot * 120}deg)` }}
            />
          ))}
        </motion.span>
        <svg viewBox="0 0 48 48" className="size-10 text-primary" fill="none" aria-hidden>
          <motion.path
            d="M4 40 L18 14 L26 28 L32 18 L44 40 Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduced ? undefined : { pathLength: 0, opacity: 0.3 }}
            animate={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </svg>
      </div>
      <div className="flex gap-1 overflow-hidden">
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="eyebrow text-[#5a7f73]"
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.06, ease: "easeInOut" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
