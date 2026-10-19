"use client";
import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/prefs";

/** A horizontal band that follows the pointer – helps learners keep their place while reading. */
export function ReadingRuler() {
  const { ruler } = usePrefs();
  const [y, setY] = useState<number | null>(null);
  useEffect(() => {
    if (!ruler) return;
    const move = (e: PointerEvent) => setY(e.clientY);
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [ruler]);
  if (!ruler || y === null) return null;
  return <div aria-hidden className="reading-ruler" style={{ top: y - 20 }} />;
}
