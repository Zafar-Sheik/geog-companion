import { CLIMATE } from "./lessons/climate";
import { GEOMORPHOLOGY } from "./lessons/geomorphology";
import { SETTLEMENT } from "./lessons/settlement";
import { ECONOMIC } from "./lessons/economic";
import { MAPWORK } from "./lessons/mapwork";
import { EXAM_QUESTIONS } from "./exam";
import type { Lesson, QuizQuestion, Term, Topic } from "./types";
import { TOPICS } from "@/lib/topics";

const TOPIC_ORDER = TOPICS.map((t) => t.topic);

/** Every lesson, in teaching order: Paper 1 topics, Paper 2 topics, then mapwork. */
export const LESSONS: Lesson[] = [...CLIMATE, ...GEOMORPHOLOGY, ...SETTLEMENT, ...ECONOMIC, ...MAPWORK].sort(
  (a, b) => TOPIC_ORDER.indexOf(a.topic) - TOPIC_ORDER.indexOf(b.topic) || a.order - b.order,
);

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsForTopic(t: Topic): Lesson[] {
  return LESSONS.filter((l) => l.topic === t);
}

export function neighbours(slug: string) {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return { prev: i > 0 ? LESSONS[i - 1] : undefined, next: i >= 0 && i < LESSONS.length - 1 ? LESSONS[i + 1] : undefined };
}

/** Topic → lesson slugs (used for topic badges). */
export const TOPIC_INDEX: Record<string, string[]> = Object.fromEntries(TOPIC_ORDER.map((t) => [t, lessonsForTopic(t).map((l) => l.slug)]));

export interface TermEntry extends Term {
  topic: Topic;
  lesson: { slug: string; title: string };
}

/** The glossary: every key concept from every lesson (duplicates removed). */
export const GLOSSARY: TermEntry[] = (() => {
  const seen = new Set<string>();
  const out: TermEntry[] = [];
  for (const l of LESSONS) {
    for (const t of l.terms) {
      const k = `${l.topic}::${t.term.toLowerCase()}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ...t, topic: l.topic, lesson: { slug: l.slug, title: l.title } });
    }
  }
  return out;
})();

export interface BankQuestion extends QuizQuestion {
  id: string;
  topic: Topic;
  lesson: { slug: string; title: string };
}

/** Every multiple-choice question from every lesson – the Quiz Arena draws from this. */
export const QUESTION_BANK: BankQuestion[] = LESSONS.flatMap((l) =>
  l.chunks.flatMap((c) =>
    c.blocks.flatMap((b) => (b.type === "quiz" ? b.questions.map((q, i) => ({ ...q, id: `${b.id}-${i}`, topic: l.topic, lesson: { slug: l.slug, title: l.title } })) : [])),
  ),
);

export { EXAM_QUESTIONS };
export type { Lesson, Topic } from "./types";
