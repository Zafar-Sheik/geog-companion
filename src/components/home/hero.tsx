"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { AuroraBackground } from "@/components/aceternity/aurora-background";
import { Spotlight } from "@/components/aceternity/spotlight";
import { FlipWords } from "@/components/aceternity/flip-words";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { MovingBorderLink } from "@/components/aceternity/moving-border";
import { gsap, motionAllowed, useGSAP } from "@/lib/gsap";

/** Hero: Aceternity aurora + spotlight, and a GSAP timeline that draws contour lines and a river, then a cross-section. */
export function Hero({ stats }: { stats: { lessons: number; tools: number; cards: number; exam: number } }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;
    const paths = el.querySelectorAll<SVGPathElement>("[data-draw]");
    const fades = el.querySelectorAll("[data-fade]");
    const pops = el.querySelectorAll("[data-pop]");
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = motionAllowed() ? `${len}` : "0";
    });
    if (!motionAllowed()) {
      gsap.set(fades, { opacity: 1, y: 0 });
      gsap.set(pops, { opacity: 1, scale: 1 });
      return;
    }
    gsap.from(fades, { opacity: 0, y: 24, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.2 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3, delay: 0.6 });
    tl.set(pops, { opacity: 0, scale: 0.6 })
      .fromTo(paths, { strokeDashoffset: (_i, t: SVGPathElement) => t.getTotalLength() }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.16, ease: "power2.inOut" })
      .to(pops, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.15, ease: "back.out(2)" })
      .to({}, { duration: 3 });
  }, { scope: root });

  return (
    <AuroraBackground className="border-b border-line">
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#2dd4bf" />
      <div ref={root} className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 md:pt-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p data-fade className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-sm font-semibold text-muted backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-mapwork" /> Northwood Boys&apos; High · CAPS Geography · Grade 12
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            <TextGenerateEffect words="Matric Geography, made interactive." highlight={["Geography", "interactive"]} />
          </h1>
          <p data-fade className="mt-5 max-w-xl text-lg text-muted">
            Bite-sized lessons on{" "}
            <FlipWords words={["cyclones", "berg winds", "river capture", "urban models", "SEZs", "gradients", "GIS"]} className="inline-block font-semibold text-brand" />
            {" "}— with hands-on tools, flashcards that adapt to you, quizzes and exam questions with memos. Built around the NSC Paper 1 and Paper 2 you&apos;ll write in November.
          </p>
          <div data-fade className="mt-8 flex flex-wrap gap-3">
            <MovingBorderLink href="/learn">Start learning <ArrowRight className="h-4 w-4" /></MovingBorderLink>
            <Link href="/flashcards" className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface/70 px-6 py-3 font-semibold backdrop-blur transition hover:border-brand/50">
              <Layers className="h-4 w-4 text-memory" /> Revise flashcards
            </Link>
          </div>
          <dl data-fade className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
            {[[String(stats.lessons), "lessons"], [String(stats.tools), "interactive tools"], [String(stats.cards), "key concepts"], [String(stats.exam), "exam case studies"]].map(([a, b]) => (
              <div key={b}>
                <dt className="sr-only">{b}</dt>
                <dd className="font-display text-3xl font-bold text-fg">{a}</dd>
                <dd className="text-sm text-muted">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-fade className="relative">
          <div className="decorative absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-brand/30 via-climate/20 to-mapwork/30 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-3xl border border-line bg-[#fdfbf3] shadow-2xl dark:bg-[#1b1a14]">
            <div className="flex items-center gap-2 border-b border-black/10 px-4 py-3 text-xs text-[#6b4423] dark:border-white/10 dark:text-[#e0c9a6]">
              <span className="font-mono font-semibold">2931CC DURBAN · 1 : 50 000</span>
              <span className="ml-auto rounded-md bg-mapwork px-2 py-0.5 font-semibold text-white">A → B</span>
            </div>
            <svg viewBox="0 0 400 300" className="diagram" role="img" aria-label="Animated contour map with a river and a cross-section">
              {[
                "M60,250 C40,180 90,90 200,80 C310,70 360,170 330,240 C300,300 90,310 60,250 Z",
                "M100,235 C85,180 120,120 200,112 C285,104 320,170 300,225 C280,275 120,280 100,235 Z",
                "M140,220 C130,180 160,145 205,142 C255,139 275,180 262,212 C248,248 150,252 140,220 Z",
                "M178,200 C175,180 190,168 210,168 C232,168 240,185 232,200 C224,215 182,216 178,200 Z",
              ].map((d, i) => <path key={i} data-draw d={d} fill="none" stroke="#a0522d" strokeWidth={i === 0 ? 2 : 1.3} />)}
              <path data-draw d="M10,40 C80,70 60,130 40,170 C20,220 70,260 120,290" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              <path data-draw d="M30,150 L370,150" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="0" />
              <g data-pop style={{ opacity: 0, transformOrigin: "205px 185px" }}>
                <polygon points="205,176 211,188 199,188" fill="#111" />
                <text x="214" y="188" fontSize="11" fontWeight="700" fill="#111">△ 1 286 m</text>
              </g>
              <g data-pop style={{ opacity: 0, transformOrigin: "30px 150px" }}><circle cx="30" cy="150" r="5" fill="#dc2626" /><text x="22" y="140" fontSize="13" fontWeight="800" fill="#dc2626">A</text></g>
              <g data-pop style={{ opacity: 0, transformOrigin: "370px 150px" }}><circle cx="370" cy="150" r="5" fill="#dc2626" /><text x="362" y="140" fontSize="13" fontWeight="800" fill="#dc2626">B</text></g>
            </svg>
            <div data-pop className="absolute right-4 bottom-4 w-56 rounded-xl border border-black/10 bg-white p-3 text-black shadow-2xl" style={{ opacity: 0 }}>
              <div className="text-[10px] font-bold tracking-wider text-[#4d7c0f] uppercase">Cross-section A–B</div>
              <svg viewBox="0 0 200 60" className="mt-1 w-full" aria-hidden>
                <path d="M0,58 L30,52 C60,40 80,18 105,12 C130,18 150,40 170,50 L200,56 L200,60 L0,60 Z" fill="#a16207" fillOpacity="0.35" stroke="#a16207" />
                <line x1="0" y1="52" x2="200" y2="52" stroke="#16a34a" strokeDasharray="4 3" />
              </svg>
              <div className="mt-1 text-xs">A and B are <strong>not intervisible</strong> – the hill blocks the view.</div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
