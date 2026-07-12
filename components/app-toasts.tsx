"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { consumeFlash, notify } from "@/lib/notify";

const WELCOME_KEY = "ghoomora:welcome";

/** Shows queued flash toasts and the post-login welcome toast on each navigation. */
export function AppToasts() {
  const pathname = usePathname();

  useEffect(() => {
    const flash = consumeFlash();
    if (flash) notify.fromFlash(flash);

    try {
      const name = sessionStorage.getItem(WELCOME_KEY);
      if (!name) return;
      sessionStorage.removeItem(WELCOME_KEY);
      notify.success(`Welcome back, ${name}`);
    } catch {
      // sessionStorage unavailable
    }
  }, [pathname]);

  return null;
}

export function setWelcomeFlag(name?: string | null) {
  try {
    sessionStorage.setItem(WELCOME_KEY, name?.trim() || "there");
  } catch {
    // sessionStorage unavailable
  }
}
