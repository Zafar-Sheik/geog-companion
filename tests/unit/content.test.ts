/**
 * Content integrity tests: every lesson, quiz, puzzle and exam question must be
 * well-formed so learners never meet a broken activity.
 */
import { describe, expect, it } from "vitest";
import { EXAM_QUESTIONS, GLOSSARY, LESSONS, QUESTION_BANK, TOPIC_INDEX } from "@/content";
import { WIDGET_CATALOGUE } from "@/components/widgets/catalogue";
import { TOPICS } from "@/lib/topics";
import type { Block } from "@/content/types";

const blocks = LESSONS.flatMap((l) => l.chunks.flatMap((c) => c.blocks.map((b) => ({ lesson: `${l.slug}/${c.id}`, b }))));
const of = <T extends Block["type"]>(t: T) => blocks.filter((x) => x.b.type === t) as { lesson: string; b: Extract<Block, { type: T }> }[];

describe("curriculum structure", () => {
  it("covers every topic with unique slugs and chunk ids", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(20);
    for (const t of TOPICS) expect(TOPIC_INDEX[t.topic].length, t.topic).toBeGreaterThanOrEqual(3);
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(LESSONS.length);
    for (const l of LESSONS) {
      expect(new Set(l.chunks.map((c) => c.id)).size, l.slug).toBe(l.chunks.length);
      expect(l.objectives.length, l.slug).toBeGreaterThan(0);
      expect(l.terms.length, `${l.slug} needs key terms`).toBeGreaterThanOrEqual(5);
      for (const c of l.chunks) expect(c.minutes, `${l.slug}/${c.id}`).toBeLessThanOrEqual(10);
    }
  });

  it("orders lessons within each topic", () => {
    for (const slugs of Object.values(TOPIC_INDEX)) {
      const orders = slugs.map((s) => LESSONS.find((l) => l.slug === s)!.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("every lesson ends with a quiz", () => {
    for (const l of LESSONS) expect(l.chunks.at(-1)!.blocks.some((b) => b.type === "quiz"), l.slug).toBe(true);
  });
});

describe("quizzes", () => {
  it("have unique ids and answers that point at a real option", () => {
    const ids = of("quiz").map((x) => x.b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { lesson, b } of of("quiz")) {
      for (const q of b.questions) {
        expect(q.options.length, `${lesson}: ${q.q}`).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options).size, `${lesson}: duplicate options`).toBe(q.options.length);
        expect(q.answer, `${lesson}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${lesson}: ${q.q}`).toBeLessThan(q.options.length);
        expect(q.explain.length).toBeGreaterThan(10);
      }
    }
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(100);
  });
});

describe("puzzles", () => {
  it("sorter items all belong to a declared bucket", () => {
    const sorters = [
      ...of("widget").filter((x) => x.b.widget === "sorter").map((x) => ({ where: x.lesson, props: x.b.props as { id: string; buckets: string[]; items: { text: string; bucket: string }[] } })),
      ...WIDGET_CATALOGUE.filter((w) => w.name === "sorter").map((w) => ({ where: `toolkit/${w.title}`, props: w.props as { id: string; buckets: string[]; items: { text: string; bucket: string }[] } })),
    ];
    expect(sorters.length).toBeGreaterThan(5);
    const ids = sorters.map((s) => s.props.id);
    expect(new Set(ids).size, "sorter ids must be unique").toBe(ids.length);
    for (const s of sorters) {
      expect(s.props.items.length, s.where).toBeGreaterThanOrEqual(4);
      expect(new Set(s.props.items.map((i) => i.text)).size, `${s.where}: duplicate items`).toBe(s.props.items.length);
      for (const it of s.props.items) expect(s.props.buckets, `${s.where}: ${it.text}`).toContain(it.bucket);
      for (const b of s.props.buckets) expect(s.props.items.some((i) => i.bucket === b), `${s.where}: empty bucket ${b}`).toBe(true);
    }
  });

  it("sequences and matches are well-formed with unique ids", () => {
    const ids = [...of("sequence").map((x) => x.b.id), ...of("match").map((x) => x.b.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const { lesson, b } of of("sequence")) {
      expect(b.steps.length, lesson).toBeGreaterThanOrEqual(3);
      expect(new Set(b.steps).size, lesson).toBe(b.steps.length);
    }
    for (const { lesson, b } of of("match")) {
      expect(b.pairs.length, lesson).toBeGreaterThanOrEqual(3);
      expect(new Set(b.pairs.map((p) => p.right)).size, lesson).toBe(b.pairs.length);
    }
  });
});

describe("glossary", () => {
  it("has a large set of defined terms", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(200);
    for (const g of GLOSSARY) {
      expect(g.term.trim(), g.term).toBe(g.term);
      expect(g.def.length, g.term).toBeGreaterThan(15);
    }
  });
});

describe("exam questions", () => {
  it("have unique ids and memos with enough points", () => {
    const ids = [...EXAM_QUESTIONS.map((q) => q.id), ...of("exam").map((x) => x.b.question.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TOPICS) expect(EXAM_QUESTIONS.some((q) => q.topic === t.topic), t.topic).toBe(true);
    const parts = [...EXAM_QUESTIONS.flatMap((q) => q.parts.map((p) => ({ where: q.id, p }))), ...of("exam").map((x) => ({ where: x.lesson, p: x.b.question }))];
    for (const { where, p } of parts) {
      expect(p.marks, where).toBeGreaterThan(0);
      // a memo must offer at least as many points as marks (1-mark answers may be a single point; long answers need extra)
      expect(p.memo.length, `${where}: ${p.q}`).toBeGreaterThanOrEqual(p.marks <= 2 ? 1 : Math.min(p.marks, 8));
    }
  });
});
