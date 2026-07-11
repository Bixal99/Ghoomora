"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function GradientText({
  children,
  className = "",
  colors = ["#cbe4db", "#e7a94e", "#8fd3bf", "#cbe4db"],
  duration = 8,
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <motion.span
      className={"inline-block bg-clip-text text-transparent " + className}
      style={{ backgroundImage: gradient, backgroundSize: "300% 100%" }}
      animate={reduced ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
