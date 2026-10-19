"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Gamepad2, Play, RotateCcw, Timer, X } from "lucide-react";
import type { Topic } from "@/content/types";
import { addXp, bumpStat } from "@/lib/progress";
import { TOPICS, topicMeta } from "@/lib/topics";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/learn/markdown";
import { ProgressBar } from "@/components/ui/progress-bar";

export interface ArenaQuestion { id: string; q: string; options: string[]; answer: number; explain: string; topic: Topic; lesson: { slug: string; title: string } }

interface Round { qs: (ArenaQuestion & { order: number[] })[]; timed: boolean }

const SECONDS = 25;

/** Mixed-topic quiz rounds drawn from every lesson's question bank. */
export function QuizArena({ bank }: { bank: ArenaQuestion[] }) {
  const [topics, setTopics] = useState<Topic[]>(TOPICS.map((t) => t.topic));
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [round, setRound] = useState<Round | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [left, setLeft] = useState(SECONDS);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const available = bank.filter((b) => topics.includes(b.topic));
  const finished = round && i >= round.qs.length;
  const q = round && !finished ? round.qs[i] : null;

  const start = () => {
    const seed = Date.now();
    const qs = shuffle(available, seed).slice(0, count).map((x, k) => ({ ...x, order: shuffle(x.options.map((_, j) => j), `${seed}-${k}`) }));
    setRound({ qs, timed });
    setI(0);
    setPicked(null);
    setAnswers([]);
    setLeft(SECONDS);
    setStreak(0);
    setBest(0);
  };

  const choose = (orig: number | null) => {
    if (!q || picked !== null) return;
    setPicked(orig ?? -1);
    setAnswers((a) => [...a, orig]);
    if (orig === q.answer) {
      setStreak((s) => { const n = s + 1; setBest((b) => Math.max(b, n)); return n; });
    } else setStreak(0);
  };

  const next = () => {
    if (!round) return;
    const n = i + 1;
    setI(n);
    setPicked(null);
    setLeft(SECONDS);
    if (n >= round.qs.length) {
      const correct = round.qs.filter((qq, k) => answers[k] === qq.answer).length;
      bumpStat("arenaRounds");
      addXp(correct * 5 + (correct === round.qs.length ? 25 : 0), "Quiz Arena round");
    }
  };

  // countdown in timed mode
  useEffect(() => {
    if (!round?.timed || !q || picked !== null) return;
    if (left <= 0) { choose(null); return; }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  });

  if (!round) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-4xl font-bold tracking-tight">Quiz Arena</h1>
        <p className="mt-2 text-lg text-muted">Build your own mixed-topic round from {bank.length} questions. Mixing topics (interleaving) is one of the best ways to prepare for an exam.</p>
        <div className="mt-6 rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold">1. Choose topics</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const on = topics.includes(t.topic);
              return (
                <button key={t.topic} onClick={() => setTopics((x) => (on ? x.filter((y) => y !== t.topic) : [...x, t.topic]))} aria-pressed={on}
                  className={cn("rounded-xl border-2 px-3 py-2 text-sm font-semibold", on ? "text-white" : "border-line text-muted")} style={on ? { background: t.colour, borderColor: t.colour } : undefined}>
                  {t.emoji} {t.topic} <span className="opacity-75">({bank.filter((b) => b.topic === t.topic).length})</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <button className="text-brand hover:underline" onClick={() => setTopics(TOPICS.filter((t) => t.paper === 1).map((t) => t.topic))}>Paper 1 only</button>·
            <button className="text-brand hover:underline" onClick={() => setTopics(TOPICS.filter((t) => t.paper === 2).map((t) => t.topic))}>Paper 2 only</button>·
            <button className="text-brand hover:underline" onClick={() => setTopics(TOPICS.map((t) => t.topic))}>Everything</button>
          </div>
          <h2 className="mt-5 font-display text-lg font-bold">2. How many questions?</h2>
          <div className="mt-2 flex gap-2">{[5, 10, 20, 30].map((n) => <button key={n} onClick={() => setCount(n)} aria-pressed={count === n} className={cn("rounded-xl px-4 py-2 text-sm font-bold", count === n ? "bg-brand text-white" : "bg-surface-2 text-muted")}>{n}</button>)}</div>
          <h2 className="mt-5 font-display text-lg font-bold">3. Mode</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setTimed(false)} aria-pressed={!timed} className={cn("rounded-xl px-4 py-2 text-sm font-bold", !timed ? "bg-brand text-white" : "bg-surface-2 text-muted")}>🧘 Relaxed</button>
            <button onClick={() => setTimed(true)} aria-pressed={timed} className={cn("flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold", timed ? "bg-danger text-white" : "bg-surface-2 text-muted")}><Timer className="h-4 w-4" /> Beat the clock ({SECONDS}s)</button>
          </div>
          <Button size="lg" className="mt-6" onClick={start} disabled={available.length === 0}><Play className="h-4 w-4" /> Start round</Button>
        </div>
        <Link href="/games" className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-settlement/50"><Gamepad2 className="h-6 w-6 text-settlement" /><span><strong>Want something lighter?</strong> <span className="text-muted">Try the revision games – term match, true/false blitz and odd one out.</span></span></Link>
      </div>
    );
  }

  if (finished) {
    const correct = round.qs.filter((qq, k) => answers[k] === qq.answer).length;
    const pct = Math.round((correct / round.qs.length) * 100);
    const byTopic = TOPICS.map((t) => ({ t, qs: round.qs.map((qq, k) => ({ qq, k })).filter(({ qq }) => qq.topic === t.topic) })).filter((x) => x.qs.length);
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-line bg-surface p-6 text-center">
          <div className="text-6xl">{pct === 100 ? "🏆" : pct >= 70 ? "🌟" : pct >= 50 ? "👍" : "💪"}</div>
          <h1 className="mt-2 font-display text-4xl font-bold">{correct} / {round.qs.length}</h1>
          <p className="text-muted">{pct}% · best streak {best} · {pct >= 70 ? "Excellent – you're exam-ready on these topics." : pct >= 50 ? "Solid. Review the ones you missed below." : "Not yet – that's what practice is for. Revisit the lessons linked below."}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2"><Button onClick={start}><RotateCcw className="h-4 w-4" /> Same settings again</Button><Button variant="secondary" onClick={() => setRound(null)}>Change settings</Button></div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {byTopic.map(({ t, qs }) => {
            const c = qs.filter(({ qq, k }) => answers[k] === qq.answer).length;
            return (
              <div key={t.topic} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex justify-between text-sm font-semibold"><span>{t.emoji} {t.topic}</span><span>{c}/{qs.length}</span></div>
                <ProgressBar className="mt-2" value={c} max={qs.length} colour={t.colour} label={t.topic} />
              </div>
            );
          })}
        </div>
        <h2 className="mt-8 font-display text-xl font-bold">Review</h2>
        <ol className="mt-3 space-y-3">
          {round.qs.map((qq, k) => {
            const ok = answers[k] === qq.answer;
            return (
              <li key={qq.id} className={cn("rounded-2xl border p-4", ok ? "border-success/40" : "border-danger/40 bg-danger/5")}>
                <div className="flex items-start gap-2">
                  {ok ? <Check className="mt-1 h-4 w-4 shrink-0 text-success" /> : <X className="mt-1 h-4 w-4 shrink-0 text-danger" />}
                  <div className="min-w-0">
                    <Markdown md={qq.q} className="prose-learn font-semibold" />
                    {!ok && <p className="text-sm">Your answer: <span className="text-danger">{answers[k] === null || answers[k] === undefined ? "(time ran out)" : qq.options[answers[k]!]}</span></p>}
                    <p className="text-sm">Correct: <strong>{qq.options[qq.answer]}</strong></p>
                    <Markdown md={qq.explain} className="prose-learn text-sm text-muted" />
                    <Link href={`/learn/${qq.lesson.slug}`} className="text-xs text-brand hover:underline">Revise: {qq.lesson.title} →</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const colour = topicMeta(q!.topic).colour;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-bold text-muted">Question {i + 1} / {round.qs.length}</span>
        <span className="flex items-center gap-3">
          {streak >= 2 && <span className="rounded-full bg-exam/15 px-2 py-0.5 font-bold text-exam">🔥 {streak} in a row</span>}
          {round.timed && <span className={cn("flex items-center gap-1 font-mono font-bold tabular-nums", left <= 5 ? "text-danger" : "text-muted")}><Timer className="h-4 w-4" />{left}s</span>}
        </span>
      </div>
      <ProgressBar value={i} max={round.qs.length} colour={colour} label="Round progress" />
      {round.timed && picked === null && <div className="mt-1 h-1 overflow-hidden rounded bg-surface-2"><div className="h-full bg-danger transition-[width] duration-1000 ease-linear" style={{ width: `${(left / SECONDS) * 100}%` }} /></div>}
      <div className="mt-5 rounded-3xl border border-line bg-surface p-6" style={{ borderTop: `5px solid ${colour}` }}>
        <div className="mb-2 text-xs font-bold" style={{ color: colour }}>{q!.topic}</div>
        <Markdown md={q!.q} className="prose-learn text-lg font-semibold" />
        <div className="mt-4 grid gap-2">
          {q!.order.map((orig, k) => {
            const isRight = picked !== null && orig === q!.answer;
            const isWrong = picked === orig && orig !== q!.answer;
            return (
              <button key={orig} onClick={() => choose(orig)} disabled={picked !== null}
                className={cn("flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition", picked === null && "border-line hover:border-brand/50 hover:bg-surface-2", isRight && "border-success bg-success/10", isWrong && "border-danger bg-danger/10", picked !== null && !isRight && !isWrong && "border-line opacity-60")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold", isRight ? "bg-success text-white" : isWrong ? "bg-danger text-white" : "bg-surface-2")}>{String.fromCharCode(65 + k)}</span>
                <Markdown md={q!.options[orig]} className="prose-learn text-[15px] [&_p]:my-0" />
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className={cn("mt-4 rounded-xl p-3 text-sm", picked === q!.answer ? "bg-success/10" : "bg-warning/10")} role="status">
            <strong>{picked === q!.answer ? "Correct! " : picked === -1 ? "Time's up! " : "Not yet. "}</strong>
            <Markdown md={q!.explain} className="prose-learn inline" />
            <div className="mt-2 text-right"><Button size="sm" onClick={next}>{i + 1 >= round.qs.length ? "See results" : "Next question"}</Button></div>
          </div>
        )}
      </div>
      <button onClick={() => setRound(null)} className="mt-4 text-sm text-muted hover:text-fg">← Quit round</button>
    </div>
  );
}
