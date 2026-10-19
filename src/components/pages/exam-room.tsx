"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BookOpenCheck, CheckCircle2, Clock, NotebookPen } from "lucide-react";
import type { ExamQuestion, Topic } from "@/content/types";
import { useProgress } from "@/lib/progress";
import { PAPER_INFO, paperLabel, TOPICS, topicMeta } from "@/lib/topics";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/chip";
import { GlowCard } from "@/components/aceternity/glow-card";
import { ExamPartCard } from "@/components/learn/exam-part";
import { Markdown } from "@/components/learn/markdown";
import { Widget } from "@/components/widgets";

const VERBS: [string, string][] = [
  ["Name / State / List / Identify", "Give the fact or term only – no explanation needed. Usually 1 mark each."],
  ["Define", "Give the exact meaning of a term (learn the flashcards!)."],
  ["Describe", "Say what something looks like or what happens – the WHAT."],
  ["Explain / Account for", "Give reasons – the WHY or HOW. Use 'because…', 'this causes…'."],
  ["Compare / Distinguish", "Give similarities and/or differences – mention BOTH sides."],
  ["Discuss", "Look at the topic from different angles; give reasons and examples."],
  ["Evaluate / Assess", "Weigh up positives and negatives, then give a judgement."],
  ["Suggest", "Give your own sensible ideas or solutions (higher order)."],
];

/** Exam-style case studies with self-marking memos, plus exam technique. */
export function ExamRoom({ questions }: { questions: ExamQuestion[] }) {
  const params = useSearchParams();
  const initialTopic = TOPICS.find((t) => t.slug === params.get("topic"))?.topic ?? null;
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [open, setOpen] = useState<string | null>(null);
  const progress = useProgress();
  const list = questions.filter((q) => !topic || q.topic === topic);
  const current = questions.find((q) => q.id === open);
  const done = (q: ExamQuestion) => q.parts.every((_, k) => progress.exams?.[`${q.id}-${k}`]);
  const scoreOf = (q: ExamQuestion) => q.parts.reduce((s, _, k) => s + (progress.exams?.[`${q.id}-${k}`]?.score ?? 0), 0);
  const totalOf = (q: ExamQuestion) => q.parts.reduce((s, p) => s + p.marks, 0);

  if (current) {
    const meta = topicMeta(current.topic);
    // NSC numbering: Q1 & Q2 are theory, Q3 is skills & techniques in both papers.
    const qNum = ({ "Climate & Weather": 1, Geomorphology: 2, Settlement: 1, "Economic Geography": 2, "Mapwork & GIS": 3 } as const)[current.topic];
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <button onClick={() => setOpen(null)} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> All exam questions</button>
        <header className="mt-4 rounded-3xl border border-line p-6" style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${meta.colour} 12%, var(--surface)), var(--surface) 60%)` }}>
          <div className="flex flex-wrap gap-2"><Chip colour={meta.colour}>{meta.emoji} {current.topic}</Chip><Chip>{paperLabel(current.paper)}</Chip><Chip>{totalOf(current)} marks · ≈ {Math.round(totalOf(current) * 1.2)} min</Chip></div>
          <h1 className="mt-3 font-display text-3xl font-bold">{current.title}</h1>
          <p className="mt-1 text-sm text-muted">Read the source carefully. Write each answer <strong>before</strong> you open the memo – that is where the learning happens.</p>
        </header>
        {current.source && <div className="mt-5 rounded-2xl border-l-4 border-exam bg-exam/5 p-4"><Markdown md={current.source} /></div>}
        {current.figure && <div className="mt-5"><div className="mb-1 text-xs font-bold text-muted uppercase">Figure (interactive)</div><Widget name={current.figure.widget} props={current.figure.props} /></div>}
        <div className="mt-6 space-y-4">
          {current.parts.map((p, k) => <ExamPartCard key={k} part={p} id={`${current.id}-${k}`} number={`${qNum}.${k + 1}`} />)}
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4 text-center">
          <div className="text-sm text-muted">Your saved total for this question</div>
          <div className="font-display text-3xl font-bold">{scoreOf(current)} / {totalOf(current)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">Exam Room</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">NSC-style data-response questions with sources and marking memos. Answer first, then tick the memo points you made – one tick, one mark.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {([1, 2] as const).map((p) => (
          <div key={p} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 font-display font-bold"><NotebookPen className="h-4 w-4 text-exam" /> {PAPER_INFO[p].title}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> {PAPER_INFO[p].duration} · {PAPER_INFO[p].marks} marks · about 1.2 minutes per mark</div>
            <ul className="mt-2 space-y-0.5 text-sm">{PAPER_INFO[p].sections.map((s) => <li key={s.name} className="flex justify-between"><span>{s.name}</span><strong>{s.marks}</strong></li>)}</ul>
          </div>
        ))}
      </div>

      <details className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <summary className="cursor-pointer font-display font-bold">📝 Exam technique: action verbs, paragraphs & timing</summary>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <dl className="space-y-2 text-sm">{VERBS.map(([v, d]) => <div key={v}><dt className="font-semibold">{v}</dt><dd className="text-muted">{d}</dd></div>)}</dl>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-surface-2 p-3"><strong>Paragraph questions (8 marks):</strong> write in full sentences, in a paragraph (not bullets), about 8 lines. Every relevant fact = 1 mark (memos often use 4 × 2 or 8 × 1). Stay on the topic asked – e.g. &lsquo;sustainable&rsquo; strategies only.</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong>Marks = facts.</strong> A 4-mark question needs at least 4 separate, clear facts. Don&apos;t repeat the question in your answer.</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong>Calculations:</strong> formula → substitution → answer → <strong>units</strong>. Show all working – marks are given for method.</div>
            <div className="rounded-xl bg-surface-2 p-3"><strong>Use the source!</strong> If a question says &lsquo;according to the extract&rsquo; or &lsquo;refer to the figure&rsquo;, quote or use evidence from it.</div>
          </div>
        </div>
      </details>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={!topic} onClick={() => setTopic(null)}>All topics</Chip>
        {TOPICS.map((t) => <Chip key={t.topic} active={topic === t.topic} onClick={() => setTopic(t.topic)}>{t.emoji} {t.topic}</Chip>)}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((q) => {
          const meta = topicMeta(q.topic);
          return (
            <button key={q.id} onClick={() => { setOpen(q.id); window.scrollTo({ top: 0 }); }} className="group text-left">
              <GlowCard colour={meta.colour} className="h-full p-5 transition group-hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-2"><Chip colour={meta.colour}>{meta.emoji} {q.topic}</Chip>{done(q) ? <span className="flex items-center gap-1 text-xs font-bold text-success"><CheckCircle2 className="h-4 w-4" /> {scoreOf(q)}/{totalOf(q)}</span> : <span className="text-xs text-muted">{totalOf(q)} marks</span>}</div>
                <h2 className="mt-3 font-display text-lg leading-tight font-bold">{q.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted"><BookOpenCheck className="h-3.5 w-3.5" /> {q.parts.length} questions · {paperLabel(q.paper)}{q.figure && " · interactive figure"}</p>
              </GlowCard>
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className={cn("mt-10 text-center text-muted")}>No questions for this topic yet.</p>}
    </div>
  );
}
