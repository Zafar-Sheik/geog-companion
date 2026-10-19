import { AlertTriangle, Brain, Coffee, Globe2, GraduationCap, KeyRound, Lightbulb } from "lucide-react";
import type { CalloutVariant } from "@/content/types";
import { Markdown } from "./markdown";

const STYLES: Record<CalloutVariant, { label: string; colour: string; icon: React.ReactNode }> = {
  key: { label: "Key idea", colour: "var(--brand)", icon: <KeyRound className="h-4 w-4" /> },
  tip: { label: "Tip", colour: "var(--info)", icon: <Lightbulb className="h-4 w-4" /> },
  mistake: { label: "Common mistake", colour: "var(--danger)", icon: <AlertTriangle className="h-4 w-4" /> },
  memory: { label: "Memory hook", colour: "var(--memory)", icon: <Brain className="h-4 w-4" /> },
  exam: { label: "Exam tip", colour: "var(--exam)", icon: <GraduationCap className="h-4 w-4" /> },
  break: { label: "Brain break", colour: "var(--success)", icon: <Coffee className="h-4 w-4" /> },
  "real-world": { label: "In the real world", colour: "var(--t-climate)", icon: <Globe2 className="h-4 w-4" /> },
};

/** Colour-coded callouts. The colour ALWAYS means the same thing, everywhere on the site. */
export function Callout({ variant, title, md }: { variant: CalloutVariant; title?: string; md: string }) {
  const s = STYLES[variant];
  return (
    <aside className="rounded-2xl border-l-4 p-4" style={{ borderColor: s.colour, background: `color-mix(in oklab, ${s.colour} 9%, transparent)` }}>
      <div className="mb-1 flex items-center gap-2 text-sm font-bold" style={{ color: s.colour }}>{s.icon} {title ?? s.label}</div>
      <Markdown md={md} />
    </aside>
  );
}
