"use client";
import { useState } from "react";
import { Widget } from "@/components/widgets";
import { WIDGET_CATALOGUE } from "@/components/widgets/catalogue";
import { Chip } from "@/components/ui/chip";
import type { Topic } from "@/content/types";
import { TOPICS, topicMeta } from "@/lib/topics";
import { cn } from "@/lib/utils";

/** All interactive tools in one place – handy for revision and for teachers projecting in class. */
export function Toolkit() {
  const [active, setActive] = useState(WIDGET_CATALOGUE[0].title);
  const [topic, setTopic] = useState<Topic | null>(null);
  const list = WIDGET_CATALOGUE.filter((w) => !topic || w.topic === topic);
  const current = WIDGET_CATALOGUE.find((w) => w.title === active)!;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">Interactive toolkit</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">Every hands-on tool from the lessons, ready for revision – or for teachers to project on the board.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={!topic} onClick={() => setTopic(null)}>All</Chip>
        {TOPICS.map((t) => <Chip key={t.topic} active={topic === t.topic} onClick={() => setTopic(t.topic)}>{t.emoji} {t.topic}</Chip>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:block lg:space-y-1">
          {list.map((w) => (
            <li key={w.title} className="shrink-0">
              <button onClick={() => setActive(w.title)} className={cn("w-56 rounded-xl border px-3 py-2 text-left transition lg:w-full", w.title === active ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface-2")}>
                <span className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: topicMeta(w.topic).colour }} />{w.title}</span>
                <span className="block text-xs text-muted">{w.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <div key={current.title} className="min-w-0"><Widget name={current.name} props={current.props} /></div>
      </div>
    </div>
  );
}
