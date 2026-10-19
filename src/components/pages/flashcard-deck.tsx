"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, RefreshCw, Repeat, Search, Shuffle, X } from "lucide-react";
import type { Topic } from "@/content/types";
import { BOX_INTERVAL_DAYS, cardId, isDue, MAX_BOX, reviewCard, useCards } from "@/lib/cards";
import { gsap, motionAllowed } from "@/lib/gsap";
import { addXp, bumpStat } from "@/lib/progress";
import { TOPICS, topicMeta } from "@/lib/topics";
import { cn, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ReadAloud } from "@/components/learn/read-aloud";

export interface DeckTerm { term: string; def: string; topic: Topic; lesson: { slug: string; title: string } }

type Mode = "due" | "all" | "glossary";

/** Global flashcard deck with Leitner-box spaced repetition. */
export function FlashcardDeck({ terms }: { terms: DeckTerm[] }) {
  const params = useSearchParams();
  const initialTopic = TOPICS.find((t) => t.slug === params.get("topic"))?.topic ?? null;
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [mode, setMode] = useState<Mode>("due");
  const [reverse, setReverse] = useState(false);
  const [seed, setSeed] = useState(1);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ right: 0, wrong: 0 });
  const [q, setQ] = useState("");
  const { cards } = useCards();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pool = terms.filter((t) => !topic || t.topic === topic);
  // Freeze the queue when the session starts so cards don't vanish mid-review.
  const queue = useMemo(() => {
    const list = mode === "due" ? pool.filter((t) => isDue(cards[cardId(t.topic, t.term)])) : pool;
    return shuffle(list, `${topic}-${mode}-${seed}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, mode, seed, mounted]);
  const card = queue[idx];
  const boxes = Array.from({ length: MAX_BOX + 1 }, (_, b) => pool.filter((t) => (cards[cardId(t.topic, t.term)]?.box ?? 0) === b).length);
  const dueCount = pool.filter((t) => isDue(cards[cardId(t.topic, t.term)])).length;

  const flip = () => {
    const next = !flipped;
    if (cardRef.current) gsap.to(cardRef.current, { rotateY: next ? 180 : 0, duration: motionAllowed() ? 0.45 : 0, ease: "power2.inOut" });
    setFlipped(next);
  };
  const answer = (knew: boolean) => {
    if (!card) return;
    reviewCard(cardId(card.topic, card.term), knew);
    bumpStat("cardsReviewed");
    setSession((s) => ({ right: s.right + (knew ? 1 : 0), wrong: s.wrong + (knew ? 0 : 1) }));
    if (cardRef.current) gsap.set(cardRef.current, { rotateY: 0 });
    setFlipped(false);
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    if (nextIdx === queue.length) addXp(Math.min(50, 5 + queue.length * 2), "Flashcard session");
  };
  const restart = () => { setSeed((s) => s + 1); setIdx(0); setFlipped(false); setSession({ right: 0, wrong: 0 }); if (cardRef.current) gsap.set(cardRef.current, { rotateY: 0 }); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode === "glossary" || ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === " ") { e.preventDefault(); flip(); }
      if (flipped && (e.key === "ArrowRight" || e.key === "k")) answer(true);
      if (flipped && (e.key === "ArrowLeft" || e.key === "j")) answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const front = card ? (reverse ? card.def : card.term) : "";
  const back = card ? (reverse ? card.term : card.def) : "";
  const colour = card ? topicMeta(card.topic).colour : "var(--memory)";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold tracking-tight">Flashcards</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">Every key concept in the syllabus. Cards you know move up a box and come back later; cards you miss come back tomorrow. A few minutes a day beats hours the night before.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Chip active={!topic} onClick={() => { setTopic(null); restart(); }}>All topics ({terms.length})</Chip>
        {TOPICS.map((t) => <Chip key={t.topic} active={topic === t.topic} onClick={() => { setTopic(t.topic); restart(); }}>{t.emoji} {t.topic}</Chip>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {([["due", `Due today (${mounted ? dueCount : "…"})`], ["all", "Practise all"], ["glossary", "Glossary"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); restart(); }} aria-pressed={mode === m} className={cn("rounded-xl px-3 py-1.5 text-sm font-bold", mode === m ? "bg-memory text-white" : "bg-surface-2 text-muted hover:text-fg")}>{label}</button>
        ))}
        {mode !== "glossary" && (
          <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} className="accent-[var(--memory)]" /><Repeat className="h-4 w-4" /> Definition first</label>
        )}
      </div>

      {mode === "glossary" ? (
        <div className="mt-6">
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms and definitions…" className="w-full bg-transparent text-sm outline-none" aria-label="Search glossary" />
          </label>
          <dl className="mt-4 grid gap-2 md:grid-cols-2">
            {pool.filter((t) => !q || `${t.term} ${t.def}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term)).map((t) => (
              <div key={t.topic + t.term} className="rounded-xl border border-line bg-surface p-3" style={{ borderLeft: `4px solid ${topicMeta(t.topic).colour}` }}>
                <dt className="font-semibold">{t.term}</dt>
                <dd className="text-sm text-muted">{t.def}</dd>
                <Link href={`/learn/${t.lesson.slug}`} className="mt-1 inline-block text-xs text-brand hover:underline">{t.lesson.title} →</Link>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_240px]">
          <div>
            {!mounted ? <div className="h-72 animate-pulse rounded-3xl bg-surface-2" /> : card ? (
              <>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
                  <span>Card {idx + 1} of {queue.length} · {card.topic}</span>
                  <span>Box {cards[cardId(card.topic, card.term)]?.box ?? 0}</span>
                </div>
                <div style={{ perspective: 1200 }}>
                  <div ref={cardRef} role="button" tabIndex={0} onClick={flip} onKeyDown={(e) => e.key === "Enter" && flip()} aria-label={flipped ? `Answer: ${back}` : `Question: ${front}. Press to flip.`}
                    className="relative h-72 cursor-pointer" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute inset-0 grid place-items-center rounded-3xl border-2 bg-surface p-6 text-center shadow-lg" style={{ backfaceVisibility: "hidden", borderColor: colour }}>
                      <div>
                        <div className="mb-2 text-xs font-bold tracking-wider uppercase" style={{ color: colour }}>{reverse ? "Which term is this?" : "Define this term"}</div>
                        <div className={cn("font-display font-bold", reverse ? "text-lg" : "text-3xl")}>{front}</div>
                        <div className="mt-4 text-xs text-muted">Tap or press space to flip</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 grid place-items-center rounded-3xl border-2 border-memory/50 bg-memory/5 p-6 text-center shadow-lg" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                      <div>
                        <div className={cn(reverse ? "font-display text-3xl font-bold" : "text-lg leading-relaxed")}>{back}</div>
                        <Link href={`/learn/${card.lesson.slug}`} onClick={(e) => e.stopPropagation()} className="mt-3 inline-block text-xs text-brand hover:underline">From: {card.lesson.title}</Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {!flipped ? (
                    <Button onClick={flip} className="bg-memory shadow-memory/25"><RefreshCw className="h-4 w-4" /> Show answer</Button>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => answer(false)} className="border-danger/40"><X className="h-4 w-4 text-danger" /> Not yet <kbd className="hidden text-xs text-muted sm:inline">←</kbd></Button>
                      <Button variant="success" onClick={() => answer(true)}><Check className="h-4 w-4" /> I knew it <kbd className="hidden text-xs opacity-70 sm:inline">→</kbd></Button>
                    </>
                  )}
                  <ReadAloud text={flipped ? back : front} />
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-success/40 bg-success/10 p-8 text-center" role="status">
                <div className="text-5xl">{queue.length ? "🎉" : "✅"}</div>
                <h2 className="mt-2 font-display text-2xl font-bold">{queue.length ? "Session complete!" : "Nothing due right now"}</h2>
                <p className="text-muted">{queue.length ? `You knew ${session.right} and are still learning ${session.wrong}.` : "Come back tomorrow, or practise all the cards now."}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button onClick={restart}><Shuffle className="h-4 w-4" /> Go again</Button>
                  {mode === "due" && <Button variant="secondary" onClick={() => { setMode("all"); restart(); }}>Practise all cards</Button>}
                </div>
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-display font-bold">Your boxes</h2>
            <p className="text-xs text-muted">Box 0 = new. Box {MAX_BOX} = mastered.</p>
            <ul className="mt-3 space-y-1.5">
              {boxes.map((n, b) => (
                <li key={b} className="text-xs">
                  <div className="flex justify-between"><span>Box {b}{b > 0 && ` · every ${BOX_INTERVAL_DAYS[b]} day${BOX_INTERVAL_DAYS[b] === 1 ? "" : "s"}`}</span><span className="font-bold tabular-nums">{mounted ? n : "–"}</span></div>
                  <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-memory transition-[width]" style={{ width: `${mounted && pool.length ? (n / pool.length) * 100 : 0}%`, opacity: 0.35 + b * 0.13 }} /></div>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-xs">This session: <strong className="text-success">{session.right} ✓</strong> · <strong className="text-danger">{session.wrong} ✗</strong></div>
            <p className="mt-3 text-xs text-muted">Keys: <kbd>space</kbd> flip · <kbd>→</kbd> knew it · <kbd>←</kbd> not yet</p>
          </aside>
        </div>
      )}
    </div>
  );
}
