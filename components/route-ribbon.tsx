"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PATH = "M 8 42 C 36 18 52 58 78 34 S 118 12 152 40 S 188 58 212 28";

export function RouteRibbon({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGCircleElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    const pin = pinRef.current;
    if (!path || !pin) return;

    const length = path.getTotalLength();

    if (reduced) {
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = "0";
      const end = path.getPointAtLength(length);
      pin.setAttribute("cx", String(end.x));
      pin.setAttribute("cy", String(end.y));
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(pin, { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.15 });
      const proxy = { t: 0 };
      tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0);
      tl.to(pin, { opacity: 1, duration: 0.2 }, 0.2);
      tl.to(proxy, {
        t: 1,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          const point = path.getPointAtLength(length * proxy.t);
          pin.setAttribute("cx", String(point.x));
          pin.setAttribute("cy", String(point.y));
        },
      }, 0);
    }, rootRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} className={cn("pointer-events-none select-none", className)} aria-hidden>
      <svg viewBox="0 0 220 70" className="h-16 w-full overflow-visible md:h-20" fill="none">
        <path d={PATH} stroke="rgba(90,127,115,.28)" strokeWidth="2" strokeDasharray="3 7" />
        <path ref={pathRef} d={PATH} stroke="#5a7f73" strokeWidth="2.25" strokeLinecap="round" />
        <circle cx="8" cy="42" r="3.5" fill="#f0b357" />
        <circle ref={pinRef} cx="8" cy="42" r="5" fill="#f0b357" stroke="#fffdf8" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
