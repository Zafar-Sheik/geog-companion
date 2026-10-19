"use client";
import { useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { solvePuzzle } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Feedback, WidgetFrame } from "./widget-frame";

export interface SorterProps {
  id?: string;
  title?: string;
  instruction?: string;
  buckets: string[];
  items: { text: string; bucket: string }[];
  colour?: string;
}

/**
 * Generic "sort these into groups" activity (push vs pull factors, economic
 * sectors, vector vs raster…). Tap a card, then tap the group it belongs to.
 */
export function Sorter({ id = "sorter", title = "Sort it out", instruction = "Tap a card, then tap the group it belongs in.", buckets, items, colour = "var(--brand)" }: SorterProps) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => shuffle(items, `${id}-${round}`), [id, items, round]);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const left = deck.filter((it) => !placed[it.text]);
  const score = items.filter((it) => placed[it.text] === it.bucket).length;

  const drop = (b: string) => {
    if (!sel || checked) return;
    setPlaced((p) => ({ ...p, [sel]: b }));
    setSel(null);
  };
  const check = () => {
    setChecked(true);
    if (score === items.length) solvePuzzle(`sorter:${id}`, 15);
  };

  return (
    <WidgetFrame title={title} instruction={instruction} colour={colour}>
      <div className="flex min-h-12 flex-wrap gap-2" aria-label="Cards to sort">
        {left.length === 0 && !checked && <p className="text-sm text-muted">All sorted – press Check.</p>}
        {left.map((it) => (
          <button key={it.text} onClick={() => setSel(sel === it.text ? null : it.text)} aria-pressed={sel === it.text}
            className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition", sel === it.text ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface-2 hover:border-brand/50")}>
            {it.text}
          </button>
        ))}
      </div>
      <div className={cn("mt-4 grid gap-3", buckets.length === 2 ? "sm:grid-cols-2" : buckets.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {buckets.map((b) => (
          <div key={b} className={cn("rounded-2xl border-2 border-dashed p-3 transition", sel ? "border-brand/60 bg-brand-soft/30" : "border-line")}>
            <button onClick={() => drop(b)} disabled={!sel || checked} className="mb-2 w-full rounded-lg bg-surface-2 px-2 py-1.5 text-sm font-bold disabled:cursor-default">
              {b} {sel && !checked && <span className="font-normal text-brand">← drop here</span>}
            </button>
            <ul className="space-y-1.5">
              {items.filter((it) => placed[it.text] === b).map((it) => {
                const ok = checked && it.bucket === b;
                const bad = checked && it.bucket !== b;
                return (
                  <li key={it.text}>
                    <button disabled={checked} onClick={() => setPlaced((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== it.text)))}
                      className={cn("w-full rounded-lg px-2 py-1 text-left text-sm", ok ? "bg-success/15" : bad ? "bg-danger/15 line-through decoration-danger/60" : "bg-surface hover:bg-surface-2")}
                      title={checked ? undefined : "Tap to send back"}>
                      {it.text}{bad && <span className="ml-1 text-xs no-underline"> → {it.bucket}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {!checked ? (
          <Button size="sm" onClick={check} disabled={left.length > 0}><Check className="h-4 w-4" /> Check</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => { setPlaced({}); setChecked(false); setRound((r) => r + 1); }}><RotateCcw className="h-4 w-4" /> Shuffle &amp; retry</Button>
        )}
      </div>
      <Feedback ok={checked ? score === items.length : null}>
        <strong>{score}/{items.length} correct.</strong> {score === items.length ? "Brilliant sorting!" : "The red ones show where they really belong."}
      </Feedback>
    </WidgetFrame>
  );
}
