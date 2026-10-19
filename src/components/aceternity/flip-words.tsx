"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** Aceternity UI "Flip Words" – cycles through words with a soft blur animation. */
export function FlipWords({ words, duration = 2600, className }: { words: string[]; duration?: number; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (document.documentElement.classList.contains("calm")) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), duration);
    return () => clearInterval(t);
  }, [words.length, duration]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[i]}
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        transition={{ duration: 0.35 }}
        className={className}
      >
        {words[i]}
      </motion.span>
    </AnimatePresence>
  );
}
