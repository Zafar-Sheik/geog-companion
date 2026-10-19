"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Circle, Clock, Ear, Eye, Focus, Hand, PenLine, PartyPopper } from "lucide-react";
import type { Lesson } from "@/content/types";
import { gsap, motionAllowed, useGSAP } from "@/lib/gsap";
import { completeLesson, markChunk, useProgress } from "@/lib/progress";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Chip, TopicChip } from "@/components/ui/chip";
import { paperLabel, topicMeta } from "@/lib/topics";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BlockRenderer } from "./block-renderer";
import { ReadAloud } from "./read-aloud";

const STYLE_ICONS = {
  visual: { icon: <Eye className="h-3.5 w-3.5" />, label: "Visual" },
  auditory: { icon: <Ear className="h-3.5 w-3.5" />, label: "Auditory" },
  "read-write": { icon: <PenLine className="h-3.5 w-3.5" />, label: "Read/write" },
  kinaesthetic: { icon: <Hand className="h-3.5 w-3.5" />, label: "Hands-on" },
};

function chunkSpeech(lesson: Lesson, idx: number): string {
  const c = lesson.chunks[idx];
  return [c.title, ...c.blocks.map((b) => (b.type === "text" ? b.md : b.type === "callout" ? `${b.title ?? ""}. ${b.md}` : b.type === "keypoints" ? b.points.join(". ") : ""))].join(". ");
}

export function LessonPlayer({ lesson, next, prev }: { lesson: Lesson; next?: { slug: string; title: string }; prev?: { slug: string; title: string } }) {
  const prefs = usePrefs();
  const progress = useProgress();
  const [idx, setIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  const read = progress.chunks[lesson.slug] ?? [];
  const meta = topicMeta(lesson.topic);
  const colour = meta.colour;
  const total = lesson.chunks.length;
  const minutes = lesson.chunks.reduce((a, c) => a + c.minutes, 0);
  const completed = Boolean(progress.completedLessons[lesson.slug]);

  // Resume where the learner left off.
  useEffect(() => {
    const firstUnread = lesson.chunks.findIndex((c) => !read.includes(c.id));
    if (firstUnread > 0) setIdx(firstUnread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.slug]);

  useGSAP(() => {
    if (!main.current || !motionAllowed()) return;
    gsap.fromTo(main.current.querySelectorAll("[data-block]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: "power2.out" });
  }, { dependencies: [idx, prefs.stepMode], scope: main });

  const goto = (n: number) => {
    setIdx(Math.max(0, Math.min(total - 1, n)));
    if (prefs.stepMode) main.current?.scrollIntoView({ behavior: motionAllowed() ? "smooth" : "auto", block: "start" });
  };
  const advance = () => {
    markChunk(lesson.slug, lesson.chunks[idx].id);
    if (idx < total - 1) goto(idx + 1);
    else finish();
  };
  const finish = () => {
    lesson.chunks.forEach((c) => markChunk(lesson.slug, c.id));
    completeLesson(lesson.slug, lesson.xp);
    setFinished(true);
  };

  // Keyboard navigation (not while typing in an editor / input)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (!prefs.stepMode) return;
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft") goto(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const chunksToShow = prefs.stepMode ? [lesson.chunks[idx]] : lesson.chunks;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="hide-in-focus mb-6">
        <Link href={`/learn?topic=${meta.slug}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> {lesson.topic} lessons</Link>
      </div>
      <header className="mb-6 rounded-3xl border border-line bg-surface p-5 md:p-7" style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${colour} 12%, var(--surface)), var(--surface) 60%)` }}>
        <div className="flex flex-wrap items-center gap-2">
          <TopicChip topic={lesson.topic} />
          <Chip>{paperLabel(lesson.paper)}</Chip>
          <span className="flex items-center gap-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> ~{minutes} min in {total} bite-sized steps</span>
          {completed && <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl"><span className="mr-2">{lesson.emoji}</span>{lesson.title}</h1>
        <p className="mt-1 text-lg text-muted">{lesson.tagline}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-1 text-xs font-bold tracking-wider text-muted uppercase">By the end you can</div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {lesson.objectives.map((o) => <li key={o} className="flex gap-2 text-sm"><BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: colour }} />{o}</li>)}
            </ul>
          </div>
          <div className="flex flex-wrap items-start gap-1.5 md:flex-col">
            {lesson.styles.map((s) => <span key={s} className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted">{STYLE_ICONS[s].icon}{STYLE_ICONS[s].label}</span>)}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={read.length} max={total} colour={colour} label="Lesson progress" />
          <span className="shrink-0 text-xs font-semibold text-muted tabular-nums">{read.length}/{total}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button onClick={() => setPrefs({ stepMode: !prefs.stepMode })} className="rounded-lg border border-line px-2.5 py-1 font-semibold text-muted hover:text-fg">{prefs.stepMode ? "Show whole lesson" : "One step at a time"}</button>
          <button onClick={() => setPrefs({ focusMode: !prefs.focusMode })} className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 font-semibold text-muted hover:text-fg"><Focus className="h-3.5 w-3.5" />{prefs.focusMode ? "Exit focus mode" : "Focus mode"}</button>
        </div>
      </header>

      <div className={cn("grid grid-cols-1 gap-6", prefs.stepMode && "lg:grid-cols-[260px_minmax(0,1fr)]")}>
        {prefs.stepMode && (
          <nav aria-label="Lesson steps" className="hide-in-focus h-fit min-w-0 rounded-2xl border border-line bg-surface p-2 lg:sticky lg:top-20">
            <ol className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
              {lesson.chunks.map((c, i) => {
                const done = read.includes(c.id);
                return (
                  <li key={c.id} className="shrink-0">
                    <button onClick={() => goto(i)} aria-current={i === idx ? "step" : undefined}
                      className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition", i === idx ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:bg-surface-2 hover:text-fg")}>
                      {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <Circle className="h-4 w-4 shrink-0" />}
                      <span className="whitespace-nowrap lg:whitespace-normal">{i + 1}. {c.title}</span>
                      <span className="ml-auto hidden text-[10px] text-muted lg:inline">{c.minutes}m</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <div ref={main} className="min-w-0 scroll-mt-20">
          {chunksToShow.map((c) => {
            const ci = lesson.chunks.indexOf(c);
            return (
              <section key={c.id} className="mb-8" aria-labelledby={`chunk-${c.id}`}>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl font-display font-bold text-white" style={{ background: colour }}>{ci + 1}</span>
                  <h2 id={`chunk-${c.id}`} className="mr-auto font-display text-2xl font-bold">{c.title}</h2>
                  <ReadAloud text={chunkSpeech(lesson, ci)} />
                </div>
                <div className="space-y-5">
                  {c.blocks.map((b, bi) => <div key={bi} data-block><BlockRenderer block={b} terms={lesson.terms} /></div>)}
                </div>
                {!prefs.stepMode && !read.includes(c.id) && (
                  <Button variant="secondary" size="sm" className="mt-4" onClick={() => markChunk(lesson.slug, c.id)}><CheckCircle2 className="h-4 w-4" /> I understand this part</Button>
                )}
              </section>
            );
          })}

          {prefs.stepMode ? (
            <div className="sticky bottom-24 z-20 flex items-center gap-2 rounded-2xl border border-line bg-elevated/90 p-2 shadow-xl backdrop-blur lg:bottom-4">
              <Button variant="ghost" onClick={() => goto(idx - 1)} disabled={idx === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <span className="mx-auto text-xs text-muted">Step {idx + 1} of {total} · use ← → keys</span>
              <Button onClick={advance}>{idx < total - 1 ? <>Got it – next <ArrowRight className="h-4 w-4" /></> : <>Finish lesson <PartyPopper className="h-4 w-4" /></>}</Button>
            </div>
          ) : (
            <Button onClick={finish} size="lg" className="w-full">Finish lesson <PartyPopper className="h-4 w-4" /></Button>
          )}

          {finished && (
            <div role="status" className="mt-6 rounded-3xl border border-success/40 bg-success/10 p-6 text-center">
              <div className="text-5xl">🎉</div>
              <h3 className="mt-2 font-display text-2xl font-bold">Lesson complete! +{lesson.xp} XP</h3>
              <p className="text-muted">Take a 2-minute brain break – stretch, drink water – then keep the streak going.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {next && <Link href={`/learn/${next.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">Next: {next.title} <ArrowRight className="h-4 w-4" /></Link>}
                <Link href={`/exam?topic=${meta.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 font-semibold">Try exam questions</Link>
                <Link href={`/flashcards?topic=${meta.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 font-semibold">Revise the flashcards</Link>
              </div>
            </div>
          )}

          <div className="hide-in-focus mt-8 flex flex-wrap justify-between gap-3 text-sm">
            {prev ? <Link href={`/learn/${prev.slug}`} className="flex items-center gap-1 text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" /> {prev.title}</Link> : <span />}
            {next && <Link href={`/learn/${next.slug}`} className="flex items-center gap-1 text-muted hover:text-fg">{next.title} <ArrowRight className="h-4 w-4" /></Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
