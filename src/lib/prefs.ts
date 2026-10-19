"use client";
import { createPersistedStore, useStore } from "./store";

export interface Prefs {
  theme: "system" | "light" | "dark" | "contrast";
  font: "default" | "atkinson" | "dyslexic";
  textScale: number;
  lineSpacing: "normal" | "relaxed" | "loose";
  /** Switch off decorative animation (also follows the OS "reduce motion" setting). */
  calm: boolean;
  /** Hide everything except the current lesson chunk. */
  focusMode: boolean;
  /** A highlight band that follows the pointer to help keep your place. */
  ruler: boolean;
  /** Show lessons one chunk at a time (recommended for ADHD). */
  stepMode: boolean;
  speechRate: number;
  /** Bold the first letters of words to guide the eye. */
  wordAnchors: boolean;
  focusMinutes: number;
}

export const DEFAULT_PREFS: Prefs = {
  theme: "system",
  font: "default",
  textScale: 1,
  lineSpacing: "relaxed",
  calm: false,
  focusMode: false,
  ruler: false,
  stepMode: true,
  speechRate: 1,
  wordAnchors: false,
  focusMinutes: 15,
};

export const prefsStore = createPersistedStore<Prefs>("geomzansi:prefs", DEFAULT_PREFS);
export const usePrefs = () => useStore(prefsStore);
export const setPrefs = prefsStore.set;
