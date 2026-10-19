"use client";
import { useState } from "react";
import { CheckSquare, Eye, PenLine, RotateCcw, Square } from "lucide-react";
import type { ExamPart } from "@/content/types";
import { recordExam } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";

const LEVELS: Record<string, string> = {
  knowledge: "Knowledge – recall",
  comprehension: "Comprehension – explain",
  application: "Application – use it",
  "higher-order": "Higher order – evaluate / suggest",
};

/**
 * One exam-style question. The learner writes an answer first (retrieval!), then
 * opens the memo and ticks every point they made – one tick = one mark, capped
 * at the question's marks, exactly how NSC markers work.
 */
export function ExamPartCard({ part, id, number, onScore }: { part: ExamPart; id: string; number?: string; onScore?: (score: number) => void }) {
  const [answer, setAnswer] = useState("");
  const [open, setOpen] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => part.memo.map(() => false));
  const [saved, setSaved] = useState<number | null>(null);
  const score = Math.min(part.marks, ticks.filter(Boolean).length);
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start gap-3">
        {number && <span className="rounded-lg bg-exam/15 px-2 py-0.5 font-mono text-sm font-bold text-exam">{number}</span>}
        <div className="min-w-0 flex-1"><Markdown md={part.q} className="prose-learn font-semibold" /></div>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-xs font-bold">({part.marks} × 1) = {part.marks}</span>
      </div>
      {part.level && <div className="mt-1 text-xs text-muted">Cognitive level: {LEVELS[part.level]}</div>}
      <label className="mt-3 block">
        <span className="mb-1 flex items-center gap-1 text-xs font-bold text-muted uppercase"><PenLine className="h-3.5 w-3.5" /> Your answer (write it before you peek)</span>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={Math.min(8, 2 + part.marks)}
          className="w-full rounded-xl border border-line bg-bg p-3 text-sm outline-none focus:border-brand" placeholder={part.marks >= 8 ? "Write in full sentences, in paragraph form…" : "Write one fact per mark…"} />
        <span className="text-xs text-muted">{words} words · aim for at least {part.marks} separate facts</span>
      </label>
      {!open ? (
        <Button size="sm" className="mt-3" variant="secondary" onClick={() => setOpen(true)}><Eye className="h-4 w-4" /> Show the memo &amp; mark myself</Button>
      ) : (
        <div className="mt-3 rounded-xl border border-exam/40 bg-exam/5 p-3">
          <div className="mb-2 text-xs font-bold text-exam uppercase">Marking memo – tick each point you made (in your own words is fine)</div>
          <ul className="space-y-1.5">
            {part.memo.map((m, i) => (
              <li key={i}>
                <button onClick={() => setTicks((t) => t.map((x, k) => (k === i ? !x : x)))} aria-pressed={ticks[i]}
                  className={cn("flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left text-sm transition hover:bg-surface-2", ticks[i] && "bg-success/10")}>
                  {ticks[i] ? <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted" />}
                  <span>{m}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Memos list more points than marks – any valid points count, up to the maximum of {part.marks}.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-bold">{score} / {part.marks}</span>
            <Button size="sm" onClick={() => { recordExam(id, score, part.marks); setSaved(score); onScore?.(score); }}>Save my mark</Button>
            <Button size="sm" variant="ghost" onClick={() => { setTicks(part.memo.map(() => false)); setOpen(false); setSaved(null); }}><RotateCcw className="h-4 w-4" /> Redo</Button>
            {saved !== null && <span role="status" className="text-sm font-semibold text-success">Saved ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
