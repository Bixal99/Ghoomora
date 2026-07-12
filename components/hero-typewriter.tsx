"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const WORDS = ["Postcard", "Trail", "Peaks", "Map", "Horizon"];
const CHAR_MS = 100;
const DELETE_MS = 60;
const HOLD_MS = 2200;

export function HeroTypewriter() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? WORDS[0] : "");
  const [showCaret, setShowCaret] = useState(!reduced);

  useEffect(() => {
    if (reduced) {
      setTyped(WORDS[0]);
      setShowCaret(false);
      return;
    }

    setTyped("");
    setShowCaret(true);

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId = 0;
    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      const word = WORDS[wordIndex];

      if (!deleting) {
        charIndex += 1;
        setTyped(word.slice(0, charIndex));

        if (charIndex >= word.length) {
          schedule(() => {
            deleting = true;
            schedule(tick, DELETE_MS);
          }, HOLD_MS);
          return;
        }

        schedule(tick, CHAR_MS);
        return;
      }

      charIndex -= 1;
      setTyped(word.slice(0, charIndex));

      if (charIndex <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % WORDS.length;
        schedule(tick, CHAR_MS);
        return;
      }

      schedule(tick, DELETE_MS);
    };

    schedule(tick, CHAR_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reduced]);

  return (
    <h1 className="display-title text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[.88] text-white">
      <span className="block uppercase tracking-[-0.04em]">Go beyond</span>
      <span className="block">
        <span>the </span>
        <span className="text-accent">{typed}</span>
        {showCaret && (
          <span
            className="hero-caret ml-1 inline-block w-[0.12em] bg-accent align-[-0.08em]"
            style={{ height: "0.82em" }}
            aria-hidden
          />
        )}
      </span>
    </h1>
  );
}
