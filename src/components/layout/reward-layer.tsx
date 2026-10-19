"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, motionAllowed } from "@/lib/gsap";
import { onReward, type BadgeDef } from "@/lib/progress";

type Toast = { id: number; text: string; kind: "xp" | "badge"; badge?: BadgeDef };

/** Shows "+XP" toasts, badge unlocks and a GSAP confetti burst. Positive feedback = dopamine = memory. */
export function RewardLayer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const confettiRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    return onReward((e) => {
      const id = ++idRef.current;
      if (e.type === "xp") {
        if (e.amount < 10) return;
        setToasts((t) => [...t.slice(-2), { id, text: `+${e.amount} XP · ${e.reason}`, kind: "xp" }]);
      } else {
        setToasts((t) => [...t.slice(-2), { id, text: e.badge.name, kind: "badge", badge: e.badge }]);
        burst();
      }
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), e.type === "badge" ? 5000 : 2600);
    });
  }, []);

  const burst = () => {
    const host = confettiRef.current;
    if (!host || !motionAllowed()) return;
    const colours = ["#0f766e", "#0369a1", "#c2410c", "#a16207", "#7c3aed", "#4d7c0f"];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("span");
      p.style.cssText = `position:absolute;left:50%;top:40%;width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px;background:${colours[i % colours.length]};border-radius:2px;`;
      host.appendChild(p);
      gsap.to(p, {
        x: (Math.random() - 0.5) * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight * 0.6 - window.innerHeight * 0.1,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 1.6 + Math.random(),
        ease: "power3.out",
        onComplete: () => p.remove(),
      });
    }
  };

  return (
    <>
      <div ref={confettiRef} aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" />
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-24 z-[96] flex flex-col items-end gap-2 lg:bottom-6">
        {toasts.map((t) =>
          t.kind === "xp" ? (
            <div key={t.id} className="rounded-full border border-line bg-elevated px-4 py-2 text-sm font-semibold shadow-xl">
              <span className="text-brand">⚡</span> {t.text}
            </div>
          ) : (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-exam/50 bg-elevated px-4 py-3 shadow-2xl">
              <span className="text-3xl">{t.badge?.emoji}</span>
              <div>
                <div className="text-xs font-bold tracking-wider text-exam uppercase">Badge unlocked</div>
                <div className="font-display font-bold">{t.badge?.name}</div>
                <div className="text-xs text-muted">{t.badge?.description}</div>
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
