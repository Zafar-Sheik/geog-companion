"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** True when the learner asked for calm mode or the OS asks for reduced motion. */
export function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.classList.contains("calm")) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, useGSAP };
