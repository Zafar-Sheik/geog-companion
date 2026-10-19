"use client";
import { useMemo, useState } from "react";
import { Check, Link2, RotateCcw } from "lucide-react";
import { solvePuzzle } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PAIR_COLOURS = ["#0f766e", "#0369a1", "#c2410c", "#7c3aed", "#a16207", "#4d7c0f", "#be185d", "#0891b2"];

/**
 * Column A ↔ Column B matching – exactly like Question 1 of the NSC papers.
 * Tap a term, then tap its description.
 */
export function Match({ id, title, pairs }: { id: string; title: string; pairs: { left: string; right: string }[] }) {
  const [round, setRound] = useState(0);
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right), `${id}-${round}`), [id, pairs, round]);
  const [sel, setSel] = useState<number | null>(null);
  const [links, setLinks] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = pairs.filter((p, i) => links[i] === p.right).length;

  const pickRight = (r: string) => {
    if (checked || sel === null) return;
    setLinks((l) => {
      const next = Object.fromEntries(Object.entries(l).filter(([, v]) => v !== r));
      return { ...next, [sel]: r };
    });
    setSel(null);
  };
  const check = () => {
    setChecked(true);
    if (score === pairs.length) solvePuzzle(id);
  };
  const colourOf = (i: number) => PAIR_COLOURS[i % PAIR_COLOURS.length];
  const leftIndexFor = (r: string) => Number(Object.entries(links).find(([, v]) => v === r)?.[0] ?? -1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-muted"><Link2 className="h-4 w-4" /> MATCH COLUMN A TO COLUMN B</div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted">Tap a term in Column A, then tap the description that fits it.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ul className="space-y-2" aria-label="Column A">
          {pairs.map((p, i) => {
            const linked = links[i] !== undefined;
            const ok = checked && links[i] === p.right;
            const bad = checked && links[i] !== p.right;
            return (
              <li key={p.left}>
                <button onClick={() => !checked && setSel(i)} aria-pressed={sel === i}
                  className={cn("flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition",
                    sel === i ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50", ok && "border-success bg-success/10", bad && "border-danger bg-danger/10")}>
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: linked ? colourOf(i) : "var(--surface-2)" }} />
                  {p.left}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2" aria-label="Column B">
          {rights.map((r) => {
            const li = leftIndexFor(r);
            return (
              <li key={r}>
                <button onClick={() => pickRight(r)} disabled={checked || sel === null}
                  className={cn("flex w-full items-start gap-2 rounded-xl border-2 border-line px-3 py-2 text-left text-sm transition", sel !== null && !checked && "hover:border-brand/60 hover:bg-surface-2")}
                  style={li >= 0 ? { borderColor: colourOf(li) } : undefined}>
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: li >= 0 ? colourOf(li) : "var(--surface-2)" }} />
                  {r}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!checked ? (
          <Button size="sm" onClick={check} disabled={Object.keys(links).length < pairs.length}><Check className="h-4 w-4" /> Check matches</Button>
        ) : (
          <>
            <span role="status" className={cn("rounded-lg px-3 py-1 text-sm font-bold", score === pairs.length ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
              {score}/{pairs.length} {score === pairs.length ? "– perfect!" : "– fix the red ones"}
            </span>
            <Button size="sm" variant="secondary" onClick={() => { setLinks({}); setChecked(false); setSel(null); setRound((r) => r + 1); }}><RotateCcw className="h-4 w-4" /> Try again</Button>
          </>
        )}
      </div>
      {checked && score < pairs.length && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
          <div className="mb-1 text-xs font-bold text-muted uppercase">Answers</div>
          <ul className="space-y-1">{pairs.map((p) => <li key={p.left}><strong>{p.left}</strong> – {p.right}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
