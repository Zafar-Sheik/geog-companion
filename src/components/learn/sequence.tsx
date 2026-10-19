"use client";
import { useMemo, useState } from "react";
import { Check, ListOrdered, RotateCcw, Undo2 } from "lucide-react";
import { solvePuzzle } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";

/**
 * "Put it in order" puzzle – tap the steps in the order they happen.
 * Tapping (not dragging) works with a mouse, a finger and a keyboard.
 */
export function Sequence({ id, title, steps, explain }: { id: string; title: string; steps: string[]; explain: string }) {
  const [round, setRound] = useState(0);
  const pool = useMemo(() => {
    let s = shuffle(steps, `${id}-${round}`);
    if (s.every((x, i) => x === steps[i])) s = [...s.slice(1), s[0]];
    return s;
  }, [id, steps, round]);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const allPlaced = picked.length === steps.length;
  const correct = checked && picked.every((p, i) => p === steps[i]);

  const check = () => {
    setChecked(true);
    if (picked.every((p, i) => p === steps[i])) solvePuzzle(id);
  };
  const reset = () => {
    setPicked([]);
    setChecked(false);
    setRound((r) => r + 1);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-muted"><ListOrdered className="h-4 w-4" /> PUT IT IN ORDER</div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted">Tap the steps in the order they happen.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-bold text-muted uppercase">Steps</div>
          <ul className="space-y-2">
            {pool.map((s) => {
              const used = picked.includes(s);
              return (
                <li key={s}>
                  <button disabled={used || checked} onClick={() => setPicked((p) => [...p, s])}
                    className={cn("w-full rounded-xl border-2 px-3 py-2 text-left text-sm transition", used ? "border-dashed border-line text-muted opacity-40" : "border-line hover:border-brand/60 hover:bg-surface-2")}>
                    {s}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="mb-1 text-xs font-bold text-muted uppercase">Your order</div>
          <ol className="min-h-24 space-y-2 rounded-xl border-2 border-dashed border-line p-2">
            {picked.length === 0 && <li className="p-2 text-sm text-muted">Nothing yet – tap a step on the left.</li>}
            {picked.map((s, i) => {
              const ok = checked && s === steps[i];
              const bad = checked && s !== steps[i];
              return (
                <li key={s} className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-sm", ok ? "bg-success/15" : bad ? "bg-danger/15" : "bg-surface-2")}>
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold text-white", ok ? "bg-success" : bad ? "bg-danger" : "bg-brand")}>{i + 1}</span>
                  <span>{s}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            {!checked && <Button size="sm" variant="secondary" disabled={!picked.length} onClick={() => setPicked((p) => p.slice(0, -1))}><Undo2 className="h-4 w-4" /> Undo</Button>}
            {!checked && <Button size="sm" disabled={!allPlaced} onClick={check}><Check className="h-4 w-4" /> Check order</Button>}
            {checked && <Button size="sm" variant="secondary" onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>}
          </div>
        </div>
      </div>
      {checked && (
        <div role="status" className={cn("mt-4 rounded-xl p-3 text-sm", correct ? "bg-success/10" : "bg-warning/10")}>
          <strong>{correct ? "Spot on! " : "Not yet – the green ones are in the right place. "}</strong>
          <Markdown md={explain} className="prose-learn" />
          {!correct && (
            <div className="mt-2"><div className="text-xs font-bold text-muted uppercase">Correct order</div>
              <ol className="ml-5 list-decimal text-sm">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
