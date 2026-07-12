"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const PREFIX = "Go beyond the ";
const SUFFIX = "postcard.";
const CHAR_MS = 70;

export function HeroTypewriter() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? SUFFIX : "");
  const [done, setDone] = useState(Boolean(reduced));

  useEffect(() => {
    if (reduced) {
      setTyped(SUFFIX);
      setDone(true);
      return;
    }

    setTyped("");
    setDone(false);
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setTyped(SUFFIX.slice(0, index));
      if (index >= SUFFIX.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, CHAR_MS);

    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <h1 className="display-title text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[.88] text-white">
      <span>{PREFIX}</span>
      <span className="text-accent">{typed}</span>
      {!done && (
        <span className="ml-0.5 inline-block w-[0.08em] animate-pulse bg-accent align-[-0.08em]" style={{ height: "0.85em" }} aria-hidden />
      )}
    </h1>
  );
}
