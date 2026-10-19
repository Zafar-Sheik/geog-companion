import { NextResponse } from "next/server";
import { EXAM_QUESTIONS, GLOSSARY, LESSONS } from "@/content";

export const dynamic = "force-static";

/**
 * Read-only JSON feed of the curriculum (lesson titles, CAPS references,
 * objectives, glossary and exam question ids). Teachers / LMS tools can use it
 * to build worksheets or link directly to lessons. Contains no learner data.
 */
export function GET() {
  return NextResponse.json({
    name: "GeoMzansi – Grade 12 Geography curriculum",
    version: 1,
    lessons: LESSONS.map((l) => ({
      slug: l.slug, url: `/learn/${l.slug}`, paper: l.paper, topic: l.topic, title: l.title, caps: l.caps,
      objectives: l.objectives, styles: l.styles, minutes: l.chunks.reduce((a, c) => a + c.minutes, 0),
      steps: l.chunks.map((c) => c.title),
    })),
    glossary: GLOSSARY.map((g) => ({ term: g.term, definition: g.def, topic: g.topic, lesson: g.lesson.slug })),
    exam: EXAM_QUESTIONS.map((q) => ({ id: q.id, title: q.title, paper: q.paper, topic: q.topic, marks: q.parts.reduce((a, p) => a + p.marks, 0) })),
  });
}
