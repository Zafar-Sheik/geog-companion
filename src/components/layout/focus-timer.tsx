"use client";
import { useEffect, useRef, useState } from "react";
import { Coffee, Pause, Play, Timer, X } from "lucide-react";
import { bumpStat, addXp } from "@/lib/progress";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

const BREAK_IDEAS = [
  "Stand up and stretch your arms above your head for 20 seconds.",
  "Drink a glass of water.",
  "Look out of a window at something far away for 20 seconds.",
  "Do 10 star jumps (jumping jacks).",
  "Take 5 slow breaths: in for 4, hold for 4, out for 4.",
  "Explain what you just learned to someone (or your pet!) in one sentence.",
];

/**
 * A short "focus sprint" timer. ADHD research supports short, timed work
 * blocks followed by movement breaks (a learner-friendly Pomodoro).
 */
export function FocusTimer() {
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState<string | null>(null);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((l) => {
        if (l === null) return l;
        if (l <= 1) {
          setRunning(false);
          setOnBreak(BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)]);
          bumpStat("focusSessions");
          addXp(20, "Focus sprint complete");
          return null;
        }
        return l - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  const mm = left !== null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition", running ? "border-mapwork bg-mapwork/10 text-mapwork" : "border-line bg-surface text-fg hover:border-brand/50")}
        aria-label="Focus timer"
        aria-expanded={open}
      >
        <Timer className="h-4 w-4" />
        <span className="tabular-nums">{mm ?? <span className="hidden lg:inline">Focus</span>}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-elevated p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold">Focus sprint</h3>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-fg"><X className="h-4 w-4" /></button>
          </div>
          <p className="mb-3 text-xs text-muted">Work in short bursts, then move your body. Short sprints help your brain stay switched on.</p>
          <div className="mb-3 flex gap-2">
            {[5, 10, 15, 25].map((m) => (
              <button key={m} onClick={() => setPrefs({ focusMinutes: m })}
                className={cn("flex-1 rounded-lg border py-1.5 text-sm", prefs.focusMinutes === m ? "border-brand bg-brand-soft text-brand" : "border-line text-muted")}>{m}m</button>
            ))}
          </div>
          <div className="flex gap-2">
            {!running ? (
              <button className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand py-2 text-sm font-semibold text-white"
                onClick={() => { setLeft(left ?? prefs.focusMinutes * 60); setRunning(true); setOnBreak(null); }}>
                <Play className="h-4 w-4" /> {left ? "Resume" : "Start"}
              </button>
            ) : (
              <button className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-surface-2 py-2 text-sm font-semibold" onClick={() => setRunning(false)}>
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            {left !== null && <button className="rounded-xl border border-line px-3 text-sm text-muted" onClick={() => { setRunning(false); setLeft(null); }}>Reset</button>}
          </div>
        </div>
      )}
      {onBreak && (
        <div role="alertdialog" aria-label="Brain break" className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-w-sm rounded-3xl border border-line bg-elevated p-6 text-center shadow-2xl">
            <Coffee className="mx-auto mb-3 h-10 w-10 text-exam" />
            <h3 className="font-display text-2xl font-bold">Brain break! 🎉</h3>
            <p className="mt-1 text-sm text-muted">You finished a focus sprint (+20 XP). Your brain stores new ideas while you rest.</p>
            <p className="mt-4 rounded-xl bg-surface-2 p-3 font-medium">{onBreak}</p>
            <button className="mt-5 w-full rounded-xl bg-brand py-2.5 font-semibold text-white" onClick={() => setOnBreak(null)}>I&apos;m back – let&apos;s go</button>
          </div>
        </div>
      )}
    </div>
  );
}
