"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { gsap, motionAllowed } from "@/lib/gsap";
import { Markdown } from "./markdown";

/** Flip cards for spaced retrieval practice. GSAP does the 3D flip. */
export function Flashcards({ cards, label = "FLASHCARDS" }: { cards: { front: string; back: string }[]; label?: string }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  const flip = () => {
    const next = !flipped;
    if (card.current && motionAllowed()) {
      gsap.to(card.current, { rotateY: next ? 180 : 0, duration: 0.5, ease: "power2.inOut" });
    } else if (card.current) {
      gsap.set(card.current, { rotateY: next ? 180 : 0 });
    }
    setFlipped(next);
  };
  const go = (d: number) => {
    setI((x) => (x + d + cards.length) % cards.length);
    setFlipped(false);
    if (card.current) gsap.set(card.current, { rotateY: 0 });
  };
  const c = cards[i];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted"><span>{label} · tap to flip</span><span>{i + 1} / {cards.length}</span></div>
      <div style={{ perspective: 1000 }}>
        <div ref={card} role="button" tabIndex={0} onClick={flip} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && flip()} aria-label={flipped ? "Card answer – press to flip back" : "Card question – press to flip"}
          className="relative h-52 cursor-pointer" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 grid place-items-center rounded-xl border-2 border-memory/40 bg-memory/5 p-4 text-center font-semibold" style={{ backfaceVisibility: "hidden" }}>
            <Markdown md={c.front} className="prose-learn text-lg" />
          </div>
          <div className="absolute inset-0 grid place-items-center rounded-xl border-2 border-brand/40 bg-brand-soft p-4 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <Markdown md={c.back} className="prose-learn" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={() => go(-1)} className="rounded-lg border border-line p-2" aria-label="Previous card"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={flip} className="flex items-center gap-1 rounded-lg bg-memory px-4 py-2 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" /> Flip</button>
        <button onClick={() => go(1)} className="rounded-lg border border-line p-2" aria-label="Next card"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
