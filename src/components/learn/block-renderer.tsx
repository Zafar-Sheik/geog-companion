"use client";
import { CheckCircle2 } from "lucide-react";
import type { Block, Term } from "@/content/types";
import { Widget } from "@/components/widgets";
import { Callout } from "./callout";
import { ExamPartCard } from "./exam-part";
import { Flashcards } from "./flashcards";
import { Markdown } from "./markdown";
import { Match } from "./match";
import { Quiz } from "./quiz";
import { Sequence } from "./sequence";

export function BlockRenderer({ block, terms = [] }: { block: Block; terms?: Term[] }) {
  switch (block.type) {
    case "text":
      return <Markdown md={block.md} />;
    case "callout":
      return <Callout variant={block.variant} title={block.title} md={block.md} />;
    case "keypoints":
      return (
        <div className="rounded-2xl border border-brand/30 bg-brand-soft/50 p-4">
          <div className="mb-2 text-sm font-bold text-brand">Remember these</div>
          <ul className="space-y-1.5">
            {block.points.map((p, i) => (
              <li key={i} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" /><Markdown md={p} className="prose-learn" /></li>
            ))}
          </ul>
        </div>
      );
    case "flashcards":
      return <Flashcards cards={block.cards} />;
    case "terms":
      return <Flashcards cards={terms.map((t) => ({ front: t.term, back: t.def }))} label="KEY CONCEPTS" />;
    case "quiz":
      return <Quiz id={block.id} questions={block.questions} />;
    case "widget":
      return <Widget name={block.widget} props={block.props} />;
    case "sequence":
      return <Sequence id={block.id} title={block.title} steps={block.steps} explain={block.explain} />;
    case "match":
      return <Match id={block.id} title={block.title} pairs={block.pairs} />;
    case "exam":
      return <ExamPartCard part={block.question} id={block.question.id} number="EXAM-STYLE" />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full border-collapse text-sm">
            {block.caption && <caption className="p-2 text-left text-xs font-bold text-muted">{block.caption}</caption>}
            <thead className="bg-surface-2"><tr>{block.headers.map((h, i) => <th key={i} className="border-b border-line px-3 py-2 text-left font-semibold">{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((r, i) => <tr key={i} className="border-b border-line/60">{r.map((c, j) => <td key={j} className="px-3 py-2 align-top"><Markdown md={c} className="prose-learn text-sm" /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
  }
}
