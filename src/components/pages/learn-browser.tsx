"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Search } from "lucide-react";
import type { Paper, Topic } from "@/content/types";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GlowCard } from "@/components/aceternity/glow-card";
import { useProgress } from "@/lib/progress";
import { paperLabel, TOPICS, topicMeta } from "@/lib/topics";
import { cn } from "@/lib/utils";

export interface LessonSummary {
  slug: string;
  paper: Paper | "both";
  topic: Topic;
  title: string;
  tagline: string;
  emoji: string;
  minutes: number;
  chunks: number;
  xp: number;
  caps: string;
}

/** Lesson roadmap with paper tabs, topic filter, search and progress. */
export function LearnBrowser({ lessons }: { lessons: LessonSummary[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const paperParam = params.get("paper");
  const paper = paperParam === "1" ? 1 : paperParam === "2" ? 2 : null;
  const topicSlug = params.get("topic");
  const topic = TOPICS.find((t) => t.slug === topicSlug)?.topic ?? null;
  const [q, setQ] = useState("");
  const progress = useProgress();

  const go = (p: 1 | 2 | null, t: string | null) => {
    const sp = new URLSearchParams();
    if (p) sp.set("paper", String(p));
    if (t) sp.set("topic", t);
    router.replace(sp.size ? `/learn?${sp}` : "/learn", { scroll: false });
  };

  const inPaper = lessons.filter((l) => !paper || l.paper === paper || l.paper === "both");
  const topics = TOPICS.filter((t) => inPaper.some((l) => l.topic === t.topic));
  const shown = useMemo(() => inPaper.filter((l) => (!topic || l.topic === topic) && (!q || `${l.title} ${l.tagline} ${l.caps}`.toLowerCase().includes(q.toLowerCase()))), [inPaper, topic, q]);
  const nextUp = shown.find((l) => !progress.completedLessons[l.slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">Lessons</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">Pick a paper or a topic, or just continue with the next lesson. Every lesson is split into small steps – stop after any step and carry on later.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {([null, 1, 2] as const).map((p) => (
          <button key={String(p)} onClick={() => go(p, null)}
            className={cn("rounded-xl px-4 py-2 text-sm font-bold transition", paper === p && !topic ? "bg-brand text-white shadow-lg" : "bg-surface-2 text-muted hover:text-fg")}>
            {p ? `Paper ${p} – ${p === 1 ? "Physical" : "Human"}` : "Everything"}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons…" className="w-40 bg-transparent text-sm outline-none" aria-label="Search lessons" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip active={!topic} onClick={() => go(paper, null)}>All topics</Chip>
        {topics.map((t) => <Chip key={t.topic} active={topic === t.topic} onClick={() => go(paper, t.slug)}>{t.emoji} {t.topic}</Chip>)}
      </div>

      {nextUp && (
        <Link href={`/learn/${nextUp.slug}`} className="mt-6 flex items-center gap-4 rounded-2xl border border-brand/40 bg-brand-soft/60 p-4 transition hover:shadow-lg">
          <span className="text-3xl">{nextUp.emoji}</span>
          <span className="flex-1">
            <span className="block text-xs font-bold tracking-wider text-brand uppercase">Up next for you</span>
            <span className="font-display text-lg font-bold">{nextUp.title}</span>
          </span>
          <span className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Continue</span>
        </Link>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((l) => {
          const read = progress.chunks[l.slug]?.length ?? 0;
          const done = Boolean(progress.completedLessons[l.slug]);
          const colour = topicMeta(l.topic).colour;
          return (
            <Link key={l.slug} href={`/learn/${l.slug}`} className="group">
              <GlowCard colour={colour} className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <Chip colour={colour}>{l.topic}</Chip>
                  {done ? <span className="flex items-center gap-1 text-xs font-bold text-success"><CheckCircle2 className="h-4 w-4" /> Done</span> : <span className="text-xs text-muted">+{l.xp} XP</span>}
                </div>
                <div className="mt-3 text-3xl">{l.emoji}</div>
                <h2 className="mt-2 font-display text-lg leading-tight font-bold">{l.title}</h2>
                <p className="mt-1 text-sm text-muted">{l.tagline}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{l.minutes} min</span>
                  <span>{l.chunks} steps</span>
                  <span>{paperLabel(l.paper)}</span>
                </div>
                <ProgressBar className="mt-3" value={done ? l.chunks : read} max={l.chunks} colour={colour} label={`${l.title} progress`} />
              </GlowCard>
            </Link>
          );
        })}
      </div>
      {shown.length === 0 && <p className="mt-10 text-center text-muted">No lessons match – try another search.</p>}
    </div>
  );
}
