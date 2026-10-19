"use client";
import { motion, stagger, useAnimate } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/** Aceternity UI "Text Generate Effect" – words fade in one after another. */
export function TextGenerateEffect({ words, className, highlight = [] }: { words: string; className?: string; highlight?: string[] }) {
  const [scope, animate] = useAnimate();
  const list = words.split(" ");
  useEffect(() => {
    animate("span", { opacity: 1, filter: "blur(0px)" }, { duration: 0.5, delay: stagger(0.08) });
  }, [animate]);
  return (
    <span ref={scope} className={cn(className)}>
      {list.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className={cn("opacity-0", highlight.includes(w.replace(/[.,!?]/g, "")) && "bg-gradient-to-r from-brand via-climate to-mapwork bg-clip-text text-transparent")}
          style={{ filter: "blur(8px)" }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </span>
  );
}
