"use client";
import { useMemo } from "react";

/** Aceternity UI "Meteors" – tiny shooting stars for card backgrounds. */
export function Meteors({ number = 14 }: { number?: number }) {
  const meteors = useMemo(
    () =>
      Array.from({ length: number }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${((i * 0.53) % 3).toFixed(2)}s`,
        duration: `${4 + ((i * 1.7) % 6)}s`,
      })),
    [number],
  );
  return (
    <div className="decorative pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {meteors.map((m, i) => (
        <span
          key={i}
          className="absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff10] before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-slate-400 before:to-transparent before:content-['']"
          style={{ left: m.left, animationDelay: m.delay, animationDuration: m.duration }}
        />
      ))}
    </div>
  );
}
