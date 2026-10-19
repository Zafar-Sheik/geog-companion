"use client";
import { cn } from "@/lib/utils";

export function Tabs<T extends string>({ tabs, value, onChange, className }: {
  tabs: { id: T; label: React.ReactNode; badge?: React.ReactNode }[]; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto no-scrollbar", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
            value === t.id ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  );
}
