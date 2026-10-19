"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Spotlight card (Aceternity "Card Spotlight" pattern) – a radial glow follows the pointer. */
export function GlowCard({ children, className, colour = "var(--brand)" }: { children: React.ReactNode; className?: string; colour?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || !ref.current) return;
        ref.current.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn("group/glow relative overflow-hidden rounded-2xl border border-line bg-surface", className)}
      style={{ ["--glow" as string]: colour }}
    >
      <div
        aria-hidden
        className="decorative pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover/glow:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklab, var(--glow) 18%, transparent), transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
