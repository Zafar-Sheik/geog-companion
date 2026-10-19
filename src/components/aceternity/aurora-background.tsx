import { cn } from "@/lib/utils";

/** Aceternity UI "Aurora Background" – slow-moving northern-lights gradient. */
export function AuroraBackground({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="decorative pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "absolute -inset-[10px] opacity-40 blur-[10px] will-change-transform animate-aurora",
            "[--aurora:repeating-linear-gradient(100deg,#0f766e_10%,#38bdf8_15%,#84cc16_20%,#fbbf24_25%,#2dd4bf_30%)]",
            "[--stripes:repeating-linear-gradient(100deg,var(--bg)_0%,var(--bg)_7%,transparent_10%,transparent_12%,var(--bg)_16%)]",
            "[background-image:var(--stripes),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%]",
            "after:absolute after:inset-0 after:content-[''] after:[background-image:var(--stripes),var(--aurora)] after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference",
            "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]",
          )}
        />
      </div>
      {children}
    </div>
  );
}
