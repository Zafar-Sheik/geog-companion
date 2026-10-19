import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Brain, FileText, Palette, Presentation, ShieldCheck, Wrench } from "lucide-react";
import { DOCS } from "@/lib/docs";
import { EXAM_QUESTIONS, GLOSSARY, LESSONS, QUESTION_BANK } from "@/content";
import { WIDGET_COUNT } from "@/components/widgets/catalogue";
import { GlowCard } from "@/components/aceternity/glow-card";

export const metadata: Metadata = { title: "Teacher Guide", description: "How to use GeoMzansi with Grade 12 Geography classes – CAPS curriculum map, learning design, ADHD support and technical documentation." };

const ICONS: Record<string, React.ReactNode> = {
  overview: <BookOpen className="h-5 w-5" />, "teacher-quick-start": <Presentation className="h-5 w-5" />, "curriculum-map": <FileText className="h-5 w-5" />,
  "learning-design": <Brain className="h-5 w-5" />, "adhd-accessibility": <Brain className="h-5 w-5" />, "design-system": <Palette className="h-5 w-5" />,
  architecture: <Wrench className="h-5 w-5" />, "content-authoring": <FileText className="h-5 w-5" />, "testing-deployment": <Wrench className="h-5 w-5" />,
  "privacy-security": <ShieldCheck className="h-5 w-5" />, faq: <BookOpen className="h-5 w-5" />,
};

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] border border-line bg-gradient-to-br from-brand/15 via-surface to-mapwork/10 p-8 md:p-12">
        <p className="text-sm font-bold tracking-wider text-brand uppercase">For Geography teachers</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Teacher Guide</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Everything you need to use GeoMzansi with your Grade 12 classes: how lessons map to CAPS and the NSC papers, the learning science behind
          the tools, how the ADHD supports work, and full technical documentation.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">{LESSONS.length} lessons</span>
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">{WIDGET_COUNT} interactive tools</span>
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">{GLOSSARY.length} key concepts</span>
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">{QUESTION_BANK.length} quiz questions</span>
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">{EXAM_QUESTIONS.length} exam case studies</span>
          <span className="rounded-full bg-surface px-3 py-1 font-semibold">No accounts · no tracking</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/teachers/docs/teacher-quick-start" className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">Read the 10-minute quick-start</Link>
          <Link href="/teachers/docs/curriculum-map" className="rounded-xl border border-line bg-surface px-5 py-2.5 font-semibold">CAPS curriculum map</Link>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS.map((d) => (
          <Link key={d.slug} href={`/teachers/docs/${d.slug}`}>
            <GlowCard className="h-full p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-brand">{ICONS[d.slug]}<span className="text-xs font-bold tracking-wider text-muted uppercase">{d.group}</span></div>
              <h2 className="mt-2 font-display text-lg font-bold">{d.title}</h2>
            </GlowCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
