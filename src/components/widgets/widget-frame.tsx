import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Consistent shell for every interactive widget: title, instruction, playground area. */
export function WidgetFrame({ title, instruction, children, className, colour = "var(--brand)" }: {
  title: string; instruction?: React.ReactNode; children: React.ReactNode; className?: string; colour?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-line bg-surface shadow-sm", className)} aria-label={title}>
      <header className="flex items-start gap-3 border-b border-line px-4 py-3" style={{ background: `color-mix(in oklab, ${colour} 8%, transparent)` }}>
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: colour }}><Sparkles className="h-4 w-4" /></span>
        <div>
          <h3 className="font-display font-bold text-fg">{title}</h3>
          {instruction && <p className="text-sm text-muted">{instruction}</p>}
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Feedback({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  if (ok === null) return null;
  return (
    <div role="status" className={cn("mt-3 rounded-xl border p-3 text-sm", ok ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10")}>
      {children}
    </div>
  );
}

/** Tiny **bold** renderer so widgets don't need the full markdown pipeline. */
export function Md({ text, className }: { text: string; className?: string }) {
  return <p className={className}>{text.split(/(\*\*[^*]+\*\*)/).map((s, i) => (s.startsWith("**") ? <strong key={i}>{s.slice(2, -2)}</strong> : s))}</p>;
}

/** Segmented control used by many widgets. */
export function Segmented<T extends string>({ options, value, onChange, colour = "var(--brand)" }: { options: { id: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void; colour?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
          className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold transition", value === o.id ? "text-white" : "border-line text-muted hover:text-fg")}
          style={value === o.id ? { background: colour, borderColor: colour } : undefined}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
