"use client";
import { useMemo, useState } from "react";
import { bumpStat } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Feedback, Md, Segmented, WidgetFrame } from "./widget-frame";

const ring = (r: number, n = 48, cx = 80, cy = 80) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
const spoke = (a: number, r1: number, r2: number) => { const t = (a * Math.PI) / 180; const w = (a % 2 ? 4 : -4); return `M${80 + Math.cos(t) * r1},${80 + Math.sin(t) * r1} Q${80 + Math.cos(t + 0.15) * ((r1 + r2) / 2) + w},${80 + Math.sin(t + 0.15) * ((r1 + r2) / 2)} ${80 + Math.cos(t) * r2},${80 + Math.sin(t) * r2}`; };

export const PATTERNS: { name: string; structure: string; text: string; paths: string; extra?: React.ReactNode }[] = [
  {
    name: "Dendritic", structure: "Uniform rock (same resistance everywhere), gentle slope",
    text: "Tree-like: tributaries join the main river at **acute angles** like branches. Forms where the rock is **uniform** (e.g. granite or horizontal sedimentary rock), so the river can erode equally in all directions. The most common pattern.",
    paths: "M80,155 L80,110 M80,110 L55,80 M80,110 L105,75 M55,80 L35,55 M55,80 L60,45 M35,55 L20,35 M35,55 L40,22 M105,75 L95,40 M105,75 L135,50 M135,50 L146,24 M135,50 L152,64 M95,40 L84,14 M95,40 L116,18 M60,45 L70,20",
  },
  {
    name: "Trellis", structure: "Alternating bands of hard and soft rock (folded / tilted layers)",
    text: "Long, **parallel** tributaries flow along valleys of **soft rock**, and join the main river at **right angles**. Short secondary streams flow down the ridges of **hard rock**. Looks like a garden trellis.",
    paths: "M10,148 L150,148 M30,148 L30,14 M65,148 L65,14 M100,148 L100,14 M135,148 L135,14 M30,40 L18,40 M30,80 L42,80 M30,115 L18,115 M65,30 L77,30 M65,70 L53,70 M65,110 L77,110 M100,45 L88,45 M100,90 L112,90 M135,30 L123,30 M135,75 L147,75 M135,118 L123,118",
    extra: <>{[47, 82, 117].map((x) => <rect key={x} x={x - 9} y="10" width="18" height="135" fill="#a16207" fillOpacity="0.15" />)}</>,
  },
  {
    name: "Rectangular", structure: "Jointed or faulted rock (lines of weakness at right angles)",
    text: "Rivers follow **joints and faults** in the rock, so both the main river and the tributaries have **right-angled bends** and join at right angles. Common on jointed sandstone and granite.",
    paths: "M20,152 L20,112 L62,112 L62,62 L108,62 L108,16 M62,86 L96,86 L96,132 L140,132 M20,132 L44,132 M108,40 L142,40 M62,62 L62,30 L36,30 M96,110 L120,110 L120,90",
    extra: <>{[40, 80, 120].map((v) => <g key={v}><line x1={v} y1="5" x2={v} y2="155" stroke="var(--text-muted)" strokeOpacity="0.2" strokeDasharray="2 4" /><line y1={v} x1="5" y2={v} x2="155" stroke="var(--text-muted)" strokeOpacity="0.2" strokeDasharray="2 4" /></g>)}</>,
  },
  {
    name: "Radial", structure: "A dome, volcano or isolated hill",
    text: "Rivers flow **outwards from a high central point** in all directions, like the spokes of a wheel. Forms on **domes and volcanic cones**.",
    paths: [0, 45, 90, 135, 180, 225, 270, 315].map((a) => spoke(a, 14, 72)).join(" "),
    extra: <><path d={ring(12)} fill="#a16207" fillOpacity="0.25" stroke="#a16207" strokeOpacity="0.5" /><text x="80" y="84" fontSize="9" textAnchor="middle" className="muted">high</text></>,
  },
  {
    name: "Centripetal", structure: "A basin, depression or crater",
    text: "Rivers flow **inwards from all sides towards a central low point** – often into a lake or pan. Forms in **basins and craters** (e.g. pans in the dry interior).",
    paths: [20, 70, 120, 165, 210, 255, 300, 340].map((a) => spoke(a, 74, 20)).join(" "),
    extra: <circle cx="80" cy="80" r="16" fill="var(--water)" fillOpacity="0.5" />,
  },
  {
    name: "Parallel", structure: "Steep, uniform slope (e.g. an escarpment or coastal plain)",
    text: "Rivers flow **side by side in the same direction** down a **steep, even slope**. They seldom join each other.",
    paths: "M20,10 Q28,80 18,150 M48,10 Q58,80 46,150 M76,10 Q84,80 74,150 M104,10 Q112,80 102,150 M132,10 Q140,80 130,150",
    extra: <text x="152" y="80" fontSize="9" transform="rotate(90 152 80)" textAnchor="middle" className="muted">slope ↓</text>,
  },
  {
    name: "Deranged", structure: "Recently glaciated or very flat, poorly drained land",
    text: "**No clear pattern**: rivers wander irregularly between many **lakes, marshes and swamps**. Forms on very flat land or where glaciers left an uneven surface of deposits.",
    paths: "M10,40 Q30,20 50,45 T80,40 M60,70 Q70,95 95,85 T130,110 M20,100 Q40,120 30,145 M100,20 Q120,40 110,60 M120,130 Q140,140 150,120",
    extra: <>{[[50, 46, 9], [96, 86, 11], [30, 120, 7], [112, 62, 8], [134, 112, 6]].map(([x, y, r]) => <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.7} fill="var(--water)" fillOpacity="0.45" />)}</>,
  },
  {
    name: "Annular", structure: "An eroded dome with rings of hard and soft rock",
    text: "Rivers follow **circular rings** of soft rock around a dome, joined by short radial streams – the river looks like **rings** around a centre.",
    paths: `${ring(30)} ${ring(55)} M80,25 L80,50 M135,80 L110,80 M80,135 L80,110 M25,80 L50,80 M80,135 L80,155`,
    extra: <circle cx="80" cy="80" r="12" fill="#a16207" fillOpacity="0.25" />,
  },
];

export function PatternSvg({ i, size = 160 }: { i: number; size?: number }) {
  const p = PATTERNS[i];
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className="diagram rounded-xl" role="img" aria-label="Drainage pattern">
      <rect width="160" height="160" fill="var(--land)" />
      {p.extra}
      <path d={p.paths} fill="none" stroke="var(--water)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DrainagePatterns() {
  const [mode, setMode] = useState<"explore" | "quiz">("explore");
  const [sel, setSel] = useState(0);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const order = useMemo(() => shuffle(PATTERNS.map((_, i) => i), `dp-${Math.floor(round / PATTERNS.length)}`), [round]);
  const qi = order[round % PATTERNS.length];
  const options = useMemo(() => shuffle([qi, ...shuffle(PATTERNS.map((_, i) => i).filter((i) => i !== qi), `o${round}`).slice(0, 3)], `q${round}`), [qi, round]);

  return (
    <WidgetFrame title="Drainage pattern detective" instruction="Explore the eight patterns and the rock structure that causes each – then test yourself." colour="var(--t-geomorph)">
      <Segmented options={[{ id: "explore", label: "Explore" }, { id: "quiz", label: "Identify (quiz)" }]} value={mode} onChange={setMode} colour="var(--t-geomorph)" />
      {mode === "explore" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-4 gap-2">
            {PATTERNS.map((p, i) => (
              <button key={p.name} onClick={() => setSel(i)} aria-pressed={sel === i} className={cn("rounded-xl border-2 p-1 text-center text-[11px] font-semibold", sel === i ? "border-geomorph" : "border-transparent hover:border-line")}>
                <PatternSvg i={i} size={64} />
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <PatternSvg i={sel} size={170} />
            <div className="text-sm">
              <h4 className="font-display text-lg font-bold">{PATTERNS[sel].name}</h4>
              <div className="mt-1 rounded-lg bg-geomorph/10 px-2 py-1 text-xs font-semibold text-geomorph">Rock structure: {PATTERNS[sel].structure}</div>
              <Md text={PATTERNS[sel].text} className="mt-2" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <PatternSvg i={qi} size={200} />
          <div className="w-full">
            <div className="text-sm font-semibold">Which drainage pattern is this?</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {options.map((o) => {
                const name = PATTERNS[o].name;
                return (
                  <button key={name} disabled={picked !== null} onClick={() => { setPicked(name); setScore((s) => ({ right: s.right + (o === qi ? 1 : 0), total: s.total + 1 })); if (o === qi) bumpStat("toolsUsed"); }}
                    className={cn("rounded-xl border-2 px-3 py-2 text-sm font-semibold", picked && o === qi ? "border-success bg-success/10" : picked === name ? "border-danger bg-danger/10" : "border-line hover:border-geomorph")}>{name}</button>
                );
              })}
            </div>
            <Feedback ok={picked ? picked === PATTERNS[qi].name : null}>
              <strong>{PATTERNS[qi].name}</strong> – {PATTERNS[qi].structure}.
            </Feedback>
            <div className="mt-3 flex items-center gap-3">
              <button disabled={!picked} onClick={() => { setRound((r) => r + 1); setPicked(null); }} className="rounded-xl bg-geomorph px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Next pattern</button>
              <span className="text-sm text-muted">Score: {score.right}/{score.total}</span>
            </div>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
