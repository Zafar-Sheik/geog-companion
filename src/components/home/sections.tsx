"use client";
import Link from "next/link";
import { useRef } from "react";
import { Accessibility, ArrowRight, Brain, Compass, Gamepad2, GraduationCap, Layers, NotebookPen, PartyPopper, Puzzle, Sparkles, Swords, Timer, Trophy } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/aceternity/card-3d";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";
import { Meteors } from "@/components/aceternity/meteors";
import { GlowCard } from "@/components/aceternity/glow-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProgressBar } from "@/components/ui/progress-bar";
import { gsap, motionAllowed, useGSAP } from "@/lib/gsap";
import { useProgress } from "@/lib/progress";
import { setPrefs, usePrefs } from "@/lib/prefs";
import { PAPER_INFO, TOPICS } from "@/lib/topics";
import { cn } from "@/lib/utils";

export interface TopicSummary {
  topic: string;
  lessons: { slug: string; title: string; emoji: string }[];
}

export function TopicTracks({ topics }: { topics: TopicSummary[] }) {
  const progress = useProgress();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20" aria-labelledby="tracks">
      <SectionHeading eyebrow="Five topics · two papers" title={<span id="tracks">Everything in the Grade 12 syllabus</span>} description="Every lesson follows the CAPS Grade 12 Geography content and the NSC exam guidelines. Start anywhere – your progress is saved on this device." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => {
          const meta = TOPICS.find((x) => x.topic === t.topic)!;
          const done = t.lessons.filter((l) => progress.completedLessons[l.slug]).length;
          return (
            <CardContainer key={t.topic} className="w-full" containerClassName="w-full">
              <CardBody className="relative h-full w-full overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm">
                <CardItem translateZ={40} className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: meta.colour }}>{meta.paper === "both" ? "Paper 1 & 2" : `Paper ${meta.paper}`} · {meta.marks}</span>
                    <span className="text-xs text-muted">{done}/{t.lessons.length} done</span>
                  </div>
                </CardItem>
                <CardItem translateZ={60} className="mt-4">
                  <h3 className="font-display text-2xl font-bold">{meta.emoji} {t.topic}</h3>
                  <p className="mt-1 text-sm text-muted">{meta.blurb}</p>
                </CardItem>
                <CardItem translateZ={30} className="mt-4 w-full">
                  <ul className="space-y-1.5">
                    {t.lessons.map((l) => (
                      <li key={l.slug} className="flex items-center gap-2 text-sm">
                        <span aria-hidden>{l.emoji}</span>
                        <span className={cn(progress.completedLessons[l.slug] && "text-muted line-through")}>{l.title}</span>
                      </li>
                    ))}
                  </ul>
                </CardItem>
                <CardItem translateZ={50} className="mt-5 w-full">
                  <ProgressBar value={done} max={t.lessons.length} colour={meta.colour} label={`${t.topic} progress`} />
                  <Link href={`/learn?topic=${meta.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: meta.colour }}>
                    {done ? "Continue" : "Start"} {t.topic} <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardItem>
              </CardBody>
            </CardContainer>
          );
        })}
        <div className="flex flex-col justify-center rounded-3xl border border-dashed border-line p-6">
          <h3 className="font-display text-xl font-bold">How the exam is built</h3>
          {([1, 2] as const).map((p) => (
            <div key={p} className="mt-3">
              <div className="text-sm font-bold">{PAPER_INFO[p].title} <span className="font-normal text-muted">· {PAPER_INFO[p].duration} · {PAPER_INFO[p].marks} marks</span></div>
              <ul className="mt-1 space-y-0.5 text-sm text-muted">{PAPER_INFO[p].sections.map((s) => <li key={s.name}>{s.name} – <strong className="text-fg">{s.marks}</strong></li>)}</ul>
            </div>
          ))}
          <p className="mt-3 text-xs text-muted">Plus 25% School-Based Assessment (tests, research project, data handling) during the year. Check the latest DBE exam guidelines with your teacher.</p>
        </div>
      </div>
    </section>
  );
}

function MiniHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative flex h-full min-h-28 w-full flex-1 overflow-hidden rounded-xl", className)}>{children}</div>;
}

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20" aria-labelledby="features">
      <SectionHeading eyebrow="Why it sticks" title={<span id="features">Learning by doing, not by reading</span>} description="Every concept comes with something to click, drag, predict, sort or calculate." />
      <BentoGrid className="md:auto-rows-[20rem]">
        <BentoGridItem
          className="md:col-span-2"
          title="20 hands-on Geography tools"
          description="Step a mid-latitude cyclone through its life cycle, drop the sea level to rejuvenate a river, toggle day and night in a valley, buffer a river in a GIS – and draw cross-sections from real contour lines."
          icon={<Compass className="h-5 w-5 text-brand" />}
          header={
            <MiniHeader className="items-center justify-around bg-gradient-to-br from-climate/15 via-geomorph/10 to-mapwork/15 p-4">
              {["🌀", "🏞️", "🏘️", "🏭", "🗺️"].map((e, k) => <span key={k} className="grid h-14 w-14 place-items-center rounded-2xl bg-surface/80 text-3xl shadow">{e}</span>)}
            </MiniHeader>
          }
        />
        <BentoGridItem
          title="Flashcards that adapt to you"
          description="Spaced repetition (Leitner boxes): cards you know come back later; cards you miss come back tomorrow."
          icon={<Layers className="h-5 w-5 text-memory" />}
          header={
            <MiniHeader className="items-center justify-center bg-memory/10 p-4">
              <div className="w-48 -rotate-3 rounded-xl border-2 border-memory/40 bg-surface p-3 text-center text-sm font-semibold shadow-lg">Katabatic wind</div>
              <div className="absolute w-48 translate-x-6 translate-y-6 rotate-3 rounded-xl border-2 border-brand/40 bg-brand-soft p-3 text-center text-xs shadow-lg">Cold air drains downslope at night</div>
            </MiniHeader>
          }
        />
        <BentoGridItem
          title="Exam Room with memos"
          description="NSC-style case studies. Write your answer first, then tick off the memo points – one tick, one mark."
          icon={<NotebookPen className="h-5 w-5 text-exam" />}
          header={<MiniHeader className="flex-col justify-center gap-1 bg-exam/10 p-3 font-mono text-xs"><div>3.2 Explain why the temperature dropped. (2 × 2)</div><div className="text-success">✓ Cold polar air replaced warm air</div><div className="text-success">✓ SW winds from higher latitudes</div></MiniHeader>}
        />
        <BentoGridItem
          className="md:col-span-2"
          title="Built for ADHD (and helpful for everyone)"
          description="One idea per screen, visible progress, focus sprints with brain breaks, a reading ruler, dyslexia-friendly fonts, read-aloud and a calm mode that switches off animation."
          icon={<Brain className="h-5 w-5 text-memory" />}
          header={
            <MiniHeader className="items-center gap-3 bg-gradient-to-r from-memory/15 via-brand/10 to-mapwork/15 p-4">
              {[[<Timer key="t" className="h-5 w-5" />, "Focus sprints"], [<Accessibility key="a" className="h-5 w-5" />, "Fonts & sizes"], [<Sparkles key="s" className="h-5 w-5" />, "Calm mode"], [<Trophy key="tr" className="h-5 w-5" />, "XP & badges"]].map(([ic, t], k) => (
                <div key={k} className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface/80 p-3 text-center text-xs font-semibold">{ic}{t}</div>
              ))}
            </MiniHeader>
          }
        />
      </BentoGrid>
    </section>
  );
}

const STEPS = [
  { icon: <Sparkles className="h-5 w-5" />, title: "Hook", text: "Every lesson starts with a real South African example – Cyclone Idai, the KZN floods, Coega, Warwick Junction – so you know WHY it matters.", colour: "var(--brand)" },
  { icon: <Compass className="h-5 w-5" />, title: "See it", text: "An interactive diagram makes the process visible: fronts moving, rivers capturing, cities growing.", colour: "var(--t-climate)" },
  { icon: <Puzzle className="h-5 w-5" />, title: "Do it", text: "Sort, match, put in order, calculate. Your hands help your brain remember.", colour: "var(--t-mapwork)" },
  { icon: <Brain className="h-5 w-5" />, title: "Check it", text: "Quick quizzes and flashcards use active recall – the most effective way to remember.", colour: "var(--memory)" },
  { icon: <GraduationCap className="h-5 w-5" />, title: "Exam it", text: "Answer real exam-style questions and mark yourself against the memo.", colour: "var(--exam)" },
  { icon: <PartyPopper className="h-5 w-5" />, title: "Celebrate", text: "XP, levels, streaks and badges reward effort – not just being right.", colour: "var(--t-settlement)" },
];

/** "How a lesson works" – a vertical timeline revealed with GSAP ScrollTrigger. */
export function LessonFlow() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!ref.current || !motionAllowed()) return;
    gsap.fromTo(ref.current.querySelector("[data-line]"), { scaleY: 0 }, {
      scaleY: 1, ease: "none", transformOrigin: "top",
      scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 60%", scrub: true },
    });
    ref.current.querySelectorAll("[data-step]").forEach((el) => {
      gsap.from(el, { opacity: 0, x: -30, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
  }, { scope: ref });
  return (
    <section className="mx-auto max-w-4xl px-4 py-20" aria-labelledby="flow">
      <SectionHeading eyebrow="Inside every lesson" title={<span id="flow">Six small steps. No walls of text.</span>} description="Lessons are split into 3–8 minute chunks with a clear Next button – perfect for short attention spans and busy matric schedules." />
      <div ref={ref} className="relative pl-10">
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-line" aria-hidden />
        <div data-line className="absolute top-0 bottom-0 left-4 w-0.5 bg-gradient-to-b from-brand via-climate to-mapwork" aria-hidden />
        <ol className="space-y-8">
          {STEPS.map((s, i) => (
            <li key={s.title} data-step className="relative">
              <span className="absolute top-1 -left-10 grid h-8 w-8 place-items-center rounded-full text-white shadow-lg" style={{ background: s.colour }}>{s.icon}</span>
              <GlowCard colour={s.colour} className="p-5">
                <div className="text-xs font-bold text-muted">STEP {i + 1}</div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </GlowCard>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TermMarquee({ terms }: { terms: { title: string; text: string; colour: string }[] }) {
  return (
    <section className="py-10" aria-label="Key concepts covered">
      <InfiniteMovingCards items={terms} speed="slow" />
    </section>
  );
}

export function PracticeStrip() {
  const items = [
    { href: "/flashcards", icon: <Layers className="h-6 w-6" />, title: "Flashcards", text: "Spaced repetition of every key concept", colour: "var(--memory)" },
    { href: "/quiz", icon: <Swords className="h-6 w-6" />, title: "Quiz Arena", text: "Mixed-topic rounds, timed or relaxed", colour: "var(--t-climate)" },
    { href: "/exam", icon: <NotebookPen className="h-6 w-6" />, title: "Exam Room", text: "Case studies with marking memos", colour: "var(--exam)" },
    { href: "/games", icon: <Gamepad2 className="h-6 w-6" />, title: "Games", text: "Term match, true/false blitz, odd one out", colour: "var(--t-settlement)" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10" aria-label="Practice modes">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="group">
            <GlowCard colour={it.colour} className="h-full p-5 transition group-hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: it.colour }}>{it.icon}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{it.title}</h3>
              <p className="text-sm text-muted">{it.text}</p>
            </GlowCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AdhdSection() {
  const prefs = usePrefs();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20" aria-labelledby="adhd">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-8 md:p-12">
        <Meteors number={18} />
        <div className="relative grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold tracking-wider text-memory uppercase">Every brain is welcome</p>
            <h2 id="adhd" className="font-display text-3xl font-bold md:text-4xl">Your brain, your settings</h2>
            <p className="mt-3 text-lg text-muted">
              ADHD brains thrive on <strong className="text-fg">novelty, quick feedback and clear next steps</strong>, and struggle with walls of text and hidden progress.
              GeoMzansi is designed around that – and you can tune it right now:
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>🧩 <strong>Chunked lessons</strong> – one idea per screen, 3–8 minutes each</li>
              <li>⏱️ <strong>Focus sprints</strong> – 5/10/15/25 minute timer with movement breaks</li>
              <li>🎯 <strong>Instant feedback</strong> – sort, match and quiz with immediate answers and XP</li>
              <li>🎨 <strong>Consistent colours</strong> – each topic has one colour; red always means a mistake, pink always a memory hook</li>
              <li>🔊 <strong>Read aloud</strong>, reading ruler, word anchors and dyslexia-friendly fonts</li>
            </ul>
          </div>
          <div className="grid content-center gap-3">
            {([
              ["stepMode", "One step at a time", "Show lessons chunk by chunk"],
              ["calm", "Calm mode", "No moving backgrounds"],
              ["ruler", "Reading ruler", "A band that follows your pointer"],
              ["wordAnchors", "Word anchors", "Bold the start of each word"],
            ] as const).map(([k, t, d]) => (
              <button key={k} onClick={() => setPrefs({ [k]: !prefs[k] })} aria-pressed={prefs[k]}
                className={cn("flex items-center justify-between rounded-2xl border p-4 text-left transition", prefs[k] ? "border-brand bg-brand-soft" : "border-line bg-surface-2 hover:border-brand/40")}>
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{d}</span></span>
                <span className={cn("h-6 w-11 rounded-full p-0.5 transition", prefs[k] ? "bg-brand" : "bg-line")}><span className={cn("block h-5 w-5 rounded-full bg-white shadow transition", prefs[k] && "translate-x-5")} /></span>
              </button>
            ))}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-2 p-4">
              <span className="mr-auto font-semibold">Reading font</span>
              {(["default", "atkinson", "dyslexic"] as const).map((f) => (
                <button key={f} onClick={() => setPrefs({ font: f })} aria-pressed={prefs.font === f} className={cn("rounded-lg px-2.5 py-1 text-sm", prefs.font === f ? "bg-brand text-white" : "bg-surface")} style={{ fontFamily: f === "atkinson" ? "Atkinson Hyperlegible" : f === "dyslexic" ? "OpenDyslexic" : undefined }}>
                  {f === "default" ? "Inter" : f === "atkinson" ? "Atkinson" : "Dyslexic"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ firstSlug }: { firstSlug: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Ready to ace Geography?</h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">No installs, no sign-up. It runs entirely in your browser – even on a phone.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/learn/${firstSlug}`} className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 font-semibold text-white shadow-xl shadow-brand/30 transition hover:brightness-110">Start lesson 1 <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/teachers" className="inline-flex items-center gap-2 rounded-2xl border border-line px-6 py-3 font-semibold transition hover:border-brand/50"><GraduationCap className="h-4 w-4" /> I&apos;m a teacher</Link>
      </div>
    </section>
  );
}
