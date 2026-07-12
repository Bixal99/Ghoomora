"use client";

import { toast } from "sonner";

export type NotifyTone = "success" | "error" | "info";

export type FlashPayload = {
  type: NotifyTone;
  message: string;
  description?: string;
};

const FLASH_KEY = "ghoomora:flash";

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description });
  },
  error(message: string, description?: string) {
    toast.error(message, { description });
  },
  info(message: string, description?: string) {
    toast.message(message, { description });
  },
  fromFlash(payload: FlashPayload) {
    if (payload.type === "success") notify.success(payload.message, payload.description);
    else if (payload.type === "error") notify.error(payload.message, payload.description);
    else notify.info(payload.message, payload.description);
  },
};

/** Queue a toast for the next page (survives client navigations). */
export function setFlash(payload: FlashPayload) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable — show immediately
    notify.fromFlash(payload);
  }
}

export function consumeFlash(): FlashPayload | null {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FLASH_KEY);
    return JSON.parse(raw) as FlashPayload;
  } catch {
    return null;
  }
}
