import type { Topic } from "@/content/types";
import { topicMeta } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function Chip({ children, className, colour, active, onClick, title }: {
  children: React.ReactNode; className?: string; colour?: string; active?: boolean; onClick?: () => void; title?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      title={title}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition",
        active ? "border-transparent bg-brand text-white" : "border-line bg-surface-2 text-muted",
        onClick && !active && "hover:border-brand/50 hover:text-fg",
        className,
      )}
      style={colour && !active ? { color: colour, borderColor: `color-mix(in oklab, ${colour} 35%, transparent)`, background: `color-mix(in oklab, ${colour} 10%, transparent)` } : undefined}
    >
      {children}
    </Comp>
  );
}

export function TopicChip({ topic }: { topic: Topic }) {
  const m = topicMeta(topic);
  return <Chip colour={m.colour}>{m.emoji} {topic}</Chip>;
}
