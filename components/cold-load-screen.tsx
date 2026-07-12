"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";

const LOADED_KEY = "ghoomora:loaded";

export function ColdLoadScreen() {
  const [showHero, setShowHero] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LOADED_KEY)) {
        setShowHero(false);
        return;
      }
      sessionStorage.setItem(LOADED_KEY, "1");
      setShowHero(true);
    } catch {
      setShowHero(true);
    }
  }, []);

  if (showHero !== true) return null;
  return <LoadingScreen />;
}
