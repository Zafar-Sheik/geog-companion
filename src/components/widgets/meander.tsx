"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Md, WidgetFrame } from "./widget-frame";

const STAGES = [
  { title: "1. A bend develops", path: "M0,130 C60,100 100,100 140,130 S220,160 260,130 S340,100 400,130", text: "Water flows **fastest on the outside** of a bend (deeper channel) → **erosion** (undercutting). On the **inside** the water is slow and shallow → **deposition**." },
  { title: "2. The meander grows", path: "M0,130 C60,60 110,60 150,130 S230,200 270,130 S350,70 400,130", text: "Erosion on the outer banks and deposition on the inner banks make the loops **bigger and more pronounced** (lateral erosion). The meander also **migrates downstream**." },
  { title: "3. The neck narrows", path: "M0,160 L150,160 C200,160 60,30 200,30 C340,30 200,160 250,160 L400,160", text: "Erosion on the outsides of two neighbouring bends brings them **closer together** – a narrow **neck** of land forms." },
  { title: "4. The neck is cut through", path: "M0,160 L400,160", old: "M180,160 C215,160 40,20 200,20 C360,20 185,160 220,160", text: "During a **flood** the river **breaks through the neck** and takes the **shorter, steeper** route. The old loop is left with slow water." },
  { title: "5. Oxbow lake", path: "M0,160 L400,160", lake: "M190,146 C215,146 50,22 200,22 C350,22 185,146 210,146", text: "**Deposition seals off** the ends of the old loop, forming a horseshoe-shaped **oxbow lake**. Over time it fills with sediment and vegetation and dries out to become a **meander scar**." },
];

/** Meander → oxbow lake, plus the asymmetric cross-section of a meander. */
export function Meander() {
  const [i, setI] = useState(0);
  const s = STAGES[i];
  return (
    <WidgetFrame title="Meanders and oxbow lakes" instruction="Step through how a river bend becomes an oxbow lake." colour="var(--t-geomorph)">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <svg viewBox="0 0 400 220" className="diagram rounded-xl border border-line" role="img" aria-label={s.title}>
          <rect width="400" height="220" fill="color-mix(in oklab, var(--t-mapwork) 18%, var(--land))" />
          {s.old && <path d={s.old} fill="none" stroke="var(--water)" strokeOpacity="0.4" strokeWidth="10" strokeLinecap="round" />}
          {s.lake && <path d={s.lake} fill="none" stroke="var(--water)" strokeWidth="10" strokeLinecap="round" />}
          {s.lake && <><circle cx="195" cy="152" r="7" fill="#d6b77a" /><circle cx="205" cy="152" r="7" fill="#d6b77a" /></>}
          <path d={s.path} fill="none" stroke="var(--water)" strokeWidth="12" strokeLinecap="round" />
          <path d={s.path} fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="6 10" />
          {i < 2 && (
            <g fontSize="9" fontWeight="700">
              <text x="72" y={i ? 64 : 96} textAnchor="middle" style={{ fill: "var(--danger)" }}>erosion (outer bank)</text>
              <text x="72" y={i ? 112 : 126} textAnchor="middle" style={{ fill: "#92400e" }}>deposition (inner)</text>
            </g>
          )}
          {i === 2 && <text x="200" y="185" fontSize="10" textAnchor="middle" fontWeight="700" style={{ fill: "var(--danger)" }}>narrow neck ↑</text>}
          {i === 4 && <text x="200" y="80" fontSize="11" textAnchor="middle" fontWeight="800">oxbow lake</text>}
          <text x="390" y="212" fontSize="9" textAnchor="end" className="muted">flow →</text>
        </svg>
        <div>
          <svg viewBox="0 0 220 120" className="diagram rounded-xl border border-line" role="img" aria-label="Cross-section of a meander">
            <rect width="220" height="120" fill="var(--surface)" />
            <path d="M0,30 L40,30 L60,92 Q110,96 150,80 Q185,62 220,58 L220,120 L0,120 Z" fill="#a16207" fillOpacity="0.35" />
            <path d="M42,40 L60,92 Q110,96 150,80 Q170,70 186,62 L42,62 Z" fill="var(--water)" fillOpacity="0.5" />
            <text x="4" y="22" fontSize="8" fontWeight="700" style={{ fill: "var(--danger)" }}>river cliff</text>
            <text x="4" y="12" fontSize="8">(undercut slope, outer bank)</text>
            <text x="216" y="44" fontSize="8" textAnchor="end" fontWeight="700" style={{ fill: "#92400e" }}>slip-off slope</text>
            <text x="216" y="54" fontSize="8" textAnchor="end">(point bar, inner bank)</text>
            <text x="64" y="84" fontSize="8">deepest, fastest</text>
          </svg>
          <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm" role="status">
            <div className="mb-1 font-display font-bold">{s.title}</div>
            <Md text={s.text} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex flex-1 justify-center gap-1">{STAGES.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Stage ${k + 1}`} className={`h-2 w-8 rounded-full ${k === i ? "bg-geomorph" : "bg-surface-2"}`} />)}</div>
        <Button size="sm" onClick={() => setI(Math.min(STAGES.length - 1, i + 1))} disabled={i === STAGES.length - 1}>Next <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </WidgetFrame>
  );
}
