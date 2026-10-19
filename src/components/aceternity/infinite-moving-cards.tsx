"use client";
import { cn } from "@/lib/utils";

/** Aceternity UI "Infinite Moving Cards" – a gently scrolling marquee (pauses on hover). */
export function InfiniteMovingCards({ items, direction = "left", speed = "normal", className }: {
  items: { title: string; text: string; colour: string }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  className?: string;
}) {
  const duration = speed === "fast" ? "25s" : speed === "normal" ? "45s" : "80s";
  const doubled = [...items, ...items];
  return (
    <div
      className={cn("relative z-10 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]", className)}
      style={{ ["--animation-duration" as string]: duration, ["--animation-direction" as string]: direction === "left" ? "forwards" : "reverse" }}
    >
      <ul className="flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4 animate-scroll hover:[animation-play-state:paused]">
        {doubled.map((item, idx) => (
          <li key={idx} aria-hidden={idx >= items.length} className="w-[280px] shrink-0 rounded-2xl border border-line bg-surface px-5 py-4 md:w-[340px]">
            <div className="mb-2 text-sm font-bold" style={{ color: item.colour }}>{item.title}</div>
            <p className="text-sm leading-relaxed text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
