"use client";
import Link from "next/link";
import { useRef } from "react";
import { Award, Download, Flame, RotateCcw, Upload, Zap } from "lucide-react";
import { BADGES, EMPTY_PROGRESS, levelFor, progressStore, streak, useProgress } from "@/lib/progress";
import { gsap, motionAllowed, useGSAP } from "@/lib/gsap";
import { ProgressBar } from "@/components/ui/progress-bar";
import { todayKey, cn } from "@/lib/utils";
import { useCards } from "@/lib/cards";

export interface TopicLessons { topic: string; colour: string; emoji: string; lessons: { slug: string; title: string; emoji: string }[] }

/** XP, level, streak calendar, badges and per-topic progress. Data never leaves the device. */
export function ProgressDashboard({ topics, cardTotal }: { topics: TopicLessons[]; cardTotal: number }) {
  const p = useProgress();
  const lvl = levelFor(p.xp);
  const s = streak(p.activity);
  const stats = { ...EMPTY_PROGRESS.stats, ...p.stats };
  const { cards } = useCards();
  const mastered = Object.values(cards).filter((c) => c.box >= 4).length;
  const examEntries = Object.values(p.exams ?? {});
  const examPct = examEntries.length ? Math.round((examEntries.reduce((a, e) => a + e.score, 0) / Math.max(1, examEntries.reduce((a, e) => a + e.total, 0))) * 100) : null;
  const weak = Object.entries(p.quizzes).filter(([, q]) => q.total && q.correct / q.total < 0.6);
  const xpRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!xpRef.current || !motionAllowed()) return;
    const obj = { v: 0 };
    gsap.to(obj, { v: p.xp, duration: 1.2, ease: "power2.out", onUpdate: () => { if (xpRef.current) xpRef.current.textContent = String(Math.round(obj.v)); } });
  }, { dependencies: [p.xp] });

  // Last 12 weeks activity heat-map
  const days: { key: string; xp: number }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 83);
  for (let i = 0; i < 84; i++) {
    const k = todayKey(d);
    days.push({ key: k, xp: p.activity[k] ?? 0 });
    d.setDate(d.getDate() + 1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">Your progress</h1>
      <p className="mt-2 text-muted">Every bit of effort counts. Progress is saved only in this browser – export it to move to another device.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-gradient-to-br from-brand/15 to-info/10 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-muted"><Zap className="h-4 w-4 text-brand" /> Experience</div>
          <div className="mt-1 font-display text-5xl font-bold"><span ref={xpRef}>{p.xp}</span> <span className="text-xl text-muted">XP</span></div>
          <div className="mt-3 text-sm">Level <strong>{lvl.level}</strong> · {lvl.need - lvl.into} XP to level {lvl.level + 1}</div>
          <ProgressBar className="mt-2" value={lvl.into} max={lvl.need} label="Level progress" />
        </div>
        <div className="rounded-3xl border border-line bg-gradient-to-br from-exam/15 to-danger/10 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-muted"><Flame className="h-4 w-4 text-exam" /> Streak</div>
          <div className="mt-1 font-display text-5xl font-bold">{s} <span className="text-xl text-muted">day{s === 1 ? "" : "s"}</span></div>
          <p className="mt-3 text-sm text-muted">Learn a little every day – even one 5-minute step keeps the streak alive.</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="text-sm font-bold text-muted">Stats</div>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-muted">Lessons</dt><dd className="font-display text-2xl font-bold">{Object.keys(p.completedLessons).length}</dd></div>
            <div><dt className="text-muted">Cards reviewed</dt><dd className="font-display text-2xl font-bold">{stats.cardsReviewed}</dd></div>
            <div><dt className="text-muted">Exam questions</dt><dd className="font-display text-2xl font-bold">{Object.keys(p.exams ?? {}).length}</dd></div>
            <div><dt className="text-muted">Arena rounds</dt><dd className="font-display text-2xl font-bold">{stats.arenaRounds}</dd></div>
            <div><dt className="text-muted">Calculations ✓</dt><dd className="font-display text-2xl font-bold">{stats.calculations}</dd></div>
          </dl>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Last 12 weeks</h2>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto" role="img" aria-label="Learning activity heat map">
          {days.map((day) => (
            <div key={day.key} title={`${day.key}: ${day.xp} XP`} className="h-3.5 w-3.5 rounded-sm"
              style={{ background: day.xp === 0 ? "var(--surface-2)" : `color-mix(in oklab, var(--brand) ${Math.min(100, 25 + day.xp)}%, transparent)` }} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Award className="h-5 w-5 text-exam" /> Badges ({p.badges.length}/{BADGES.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map((b) => {
            const has = p.badges.includes(b.id);
            return (
              <div key={b.id} className={cn("flex items-center gap-3 rounded-2xl border p-3", has ? "border-exam/50 bg-exam/10" : "border-line bg-surface opacity-60 grayscale")}>
                <span className="text-3xl">{b.emoji}</span>
                <div><div className="font-semibold">{b.name}</div><div className="text-xs text-muted">{b.description}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="text-sm font-bold text-muted">🃏 Flashcards mastered</div>
          <div className="mt-1 font-display text-4xl font-bold">{mastered}<span className="text-lg text-muted"> / {cardTotal}</span></div>
          <ProgressBar className="mt-2" value={mastered} max={cardTotal} colour="var(--memory)" label="Flashcards mastered" />
          <Link href="/flashcards" className="mt-3 inline-block text-sm font-semibold text-memory">Review due cards →</Link>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="text-sm font-bold text-muted">📝 Exam Room average</div>
          <div className="mt-1 font-display text-4xl font-bold">{examPct === null ? "–" : `${examPct}%`}</div>
          <p className="mt-2 text-sm text-muted">{examPct === null ? "Self-mark a few exam questions to see your average." : examPct >= 60 ? "Strong exam answers – keep practising paragraph questions." : "Aim for one fact per mark and use the source."}</p>
          <Link href="/exam" className="mt-3 inline-block text-sm font-semibold text-exam">Open the Exam Room →</Link>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="text-sm font-bold text-muted">🎯 Quizzes to redo</div>
          {weak.length ? <p className="mt-2 text-sm">You scored under 60% on <strong>{weak.length}</strong> lesson quiz{weak.length === 1 ? "" : "zes"}. Redo them from the lessons below (🟡).</p> : <p className="mt-2 text-sm text-muted">No weak quizzes yet – nice!</p>}
          <Link href="/quiz" className="mt-3 inline-block text-sm font-semibold text-climate">Mixed practice in the Quiz Arena →</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((g) => {
          const done = g.lessons.filter((l) => p.completedLessons[l.slug]).length;
          return (
            <div key={g.topic} className="rounded-3xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between"><h3 className="font-display font-bold" style={{ color: g.colour }}>{g.emoji} {g.topic}</h3><span className="text-sm text-muted">{done}/{g.lessons.length}</span></div>
              <ProgressBar className="mt-2" value={done} max={g.lessons.length} colour={g.colour} label={g.topic} />
              <ul className="mt-3 space-y-1 text-sm">
                {g.lessons.map((l) => (
                  <li key={l.slug}><Link href={`/learn/${l.slug}`} className="flex items-center gap-2 hover:underline">
                    <span>{p.completedLessons[l.slug] ? "✅" : (p.chunks[l.slug]?.length ? "🟡" : "⚪")}</span>{l.title}
                  </Link></li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-8 flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm" onClick={() => {
          const blob = new Blob([JSON.stringify(progressStore.get(), null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "geomzansi-progress.json";
          a.click();
        }}><Download className="h-4 w-4" /> Export progress</button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm">
          <Upload className="h-4 w-4" /> Import progress
          <input type="file" accept="application/json" className="sr-only" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const data = JSON.parse(await f.text());
              progressStore.set({ ...EMPTY_PROGRESS, ...data });
            } catch {
              window.alert("That file is not a GeoMzansi progress file.");
            }
          }} />
        </label>
        <button className="inline-flex items-center gap-2 rounded-xl border border-danger/40 px-4 py-2 text-sm text-danger" onClick={() => { if (window.confirm("Delete ALL your progress on this device? This cannot be undone.")) progressStore.reset(); }}><RotateCcw className="h-4 w-4" /> Reset</button>
      </section>
    </div>
  );
}
