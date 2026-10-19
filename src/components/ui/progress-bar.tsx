import { cn } from "@/lib/utils";

export function ProgressBar({ value, max = 100, className, colour = "var(--brand)", label }: { value: number; max?: number; className?: string; colour?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: colour }} />
    </div>
  );
}
