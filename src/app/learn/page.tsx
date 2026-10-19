import type { Metadata } from "next";
import { Suspense } from "react";
import { LESSONS } from "@/content";
import { LearnBrowser, type LessonSummary } from "@/components/pages/learn-browser";

export const metadata: Metadata = { title: "Lessons", description: "CAPS Grade 12 Geography lessons: climate & weather, geomorphology, settlement, economic geography, mapwork and GIS." };

export default function LearnPage() {
  const summaries: LessonSummary[] = LESSONS.map((l) => ({
    slug: l.slug, paper: l.paper, topic: l.topic, title: l.title, tagline: l.tagline, emoji: l.emoji, xp: l.xp, caps: l.caps,
    minutes: l.chunks.reduce((a, c) => a + c.minutes, 0), chunks: l.chunks.length,
  }));
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-muted">Loading lessons…</div>}>
      <LearnBrowser lessons={summaries} />
    </Suspense>
  );
}
