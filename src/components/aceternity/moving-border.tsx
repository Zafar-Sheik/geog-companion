"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Aceternity UI "Moving Border" button – a glowing light runs around the border. */
export function MovingBorderLink({ href, children, className, containerClassName }: {
  href: string; children: React.ReactNode; className?: string; containerClassName?: string;
}) {
  return (
    <Link href={href} className={cn("group relative inline-flex overflow-hidden rounded-2xl p-[2px]", containerClassName)}>
      <span
        aria-hidden
        className="decorative absolute inset-[-200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#38bdf8_0%,#0f766e_25%,#fbbf24_50%,#84cc16_75%,#38bdf8_100%)]"
      />
      <span className={cn("relative inline-flex items-center gap-2 rounded-[14px] bg-elevated px-6 py-3 font-semibold text-fg backdrop-blur-xl transition group-hover:bg-surface-2", className)}>
        {children}
      </span>
    </Link>
  );
}
