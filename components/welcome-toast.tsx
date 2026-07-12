"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const WELCOME_KEY = "ghoomora:welcome";

export function WelcomeToast() {
  useEffect(() => {
    try {
      const name = sessionStorage.getItem(WELCOME_KEY);
      if (!name) return;
      sessionStorage.removeItem(WELCOME_KEY);
      toast.success(`Welcome back, ${name}`);
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  return null;
}

export function setWelcomeFlag(name?: string | null) {
  try {
    sessionStorage.setItem(WELCOME_KEY, name?.trim() || "there");
  } catch {
    // sessionStorage unavailable
  }
}
