"use client";
import { useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { usePrefs } from "@/lib/prefs";

/** Text-to-speech using the browser's Web Speech API (supports auditory learners). */
export function ReadAloud({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const { speechRate } = usePrefs();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  if (!supported) return null;
  const clean = text
    .replace(/```[\s\S]*?```/g, " (code example) ")
    .replace(/[`*_#>|]/g, "")
    .replace(/:=/g, " becomes ")
    .replace(/\s+/g, " ");
  return (
    <button
      onClick={() => {
        const s = window.speechSynthesis;
        if (speaking) {
          s.cancel();
          setSpeaking(false);
          return;
        }
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = "en-ZA";
        u.rate = speechRate;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        s.cancel();
        s.speak(u);
        setSpeaking(true);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-brand/50 hover:text-fg"
      aria-pressed={speaking}
    >
      {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />} {speaking ? "Stop" : label}
    </button>
  );
}
