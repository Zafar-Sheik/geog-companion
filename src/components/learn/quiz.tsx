"use client";
import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { QuizQuestion } from "@/content/types";
import { recordQuiz } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";

/**
 * One question at a time, instant feedback with an explanation. Wrong answers
 * are framed as learning, never as failure ("Not yet!").
 */
export function Quiz({ id, questions }: { id: string; questions: QuizQuestion[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[i];

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= questions.length) {
      setDone(true);
      recordQuiz(id, score, questions.length);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <div className="text-5xl">{pct === 100 ? "🏆" : pct >= 60 ? "🌟" : "💪"}</div>
        <h3 className="mt-2 font-display text-2xl font-bold">{score} / {questions.length}</h3>
        <p className="text-muted">{pct === 100 ? "Perfect score – brilliant!" : pct >= 60 ? "Great work! Review the ones you missed." : "Not yet – and that's okay. Re-read the steps and try again."}</p>
        <Button className="mt-4" variant="secondary" onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }}><RotateCcw className="h-4 w-4" /> Try again</Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-muted">
        <span>QUICK CHECK · Question {i + 1} of {questions.length}</span>
        <span className="flex gap-1">{questions.map((_, k) => <span key={k} className={cn("h-1.5 w-6 rounded-full", k < i ? "bg-brand" : k === i ? "bg-brand/50" : "bg-surface-2")} />)}</span>
      </div>
      <Markdown md={q.q} className="prose-learn font-semibold" />
      <div className="mt-3 grid gap-2">
        {q.options.map((o, k) => {
          const isRight = picked !== null && k === q.answer;
          const isWrong = picked === k && k !== q.answer;
          return (
            <button key={k} onClick={() => pick(k)} disabled={picked !== null}
              className={cn("flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition",
                picked === null && "border-line hover:border-brand/50 hover:bg-surface-2",
                isRight && "border-success bg-success/10", isWrong && "border-danger bg-danger/10", picked !== null && !isRight && !isWrong && "border-line opacity-60")}>
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold", isRight ? "bg-success text-white" : isWrong ? "bg-danger text-white" : "bg-surface-2")}>
                {isRight ? <Check className="h-4 w-4" /> : isWrong ? <X className="h-4 w-4" /> : String.fromCharCode(65 + k)}
              </span>
              <Markdown md={o} className="prose-learn text-[15px] leading-snug [&_p]:my-0" />
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={cn("mt-3 rounded-xl p-3 text-sm", picked === q.answer ? "bg-success/10" : "bg-warning/10")}>
          <strong>{picked === q.answer ? "Correct! " : "Not yet. "}</strong>
          <Markdown md={q.explain} className="prose-learn inline" />
          <div className="mt-2 text-right"><Button size="sm" onClick={next}>{i + 1 >= questions.length ? "See my score" : "Next question"}</Button></div>
        </div>
      )}
    </div>
  );
}
