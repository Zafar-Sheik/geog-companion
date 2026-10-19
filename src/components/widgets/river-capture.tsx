"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Md, WidgetFrame } from "./widget-frame";

const STAGES = [
  {
    title: "1. Two rivers, one watershed",
    text: "**River B** flows south along a gentle gradient. **River A** flows east on a **steeper gradient** (or over **softer rock**) to a lower base level. A **watershed** separates their drainage basins.",
    headX: 250,
  },
  {
    title: "2. Headward erosion",
    text: "River A has more energy, so it **erodes headwards** (backwards towards its source) faster. Its source cuts back through the **watershed** towards River B.",
    headX: 170,
  },
  {
    title: "3. Capture!",
    text: "River A **breaks through** and **intercepts** River B. The **headwaters of B are diverted** into A – A is now the **captor stream** and the diverted water is the **captured stream**. The sharp bend where this happens is the **elbow of capture**.",
    headX: 120,
  },
  {
    title: "4. After the capture",
    text: "Below the elbow, River B has lost its headwaters: it is a **misfit stream** (beheaded stream) – far **too small for its wide valley**. The dry section of valley between the elbow and the misfit's new source is a **wind gap** (dry gap). River A has more water and erodes even faster.",
    headX: 120,
  },
];

export function RiverCapture() {
  const [i, setI] = useState(0);
  const s = STAGES[i];
  const captured = i >= 2;

  return (
    <WidgetFrame title="River capture (river piracy)" instruction="Step through how one river steals the water of another." colour="var(--t-geomorph)">
      <svg viewBox="0 0 400 260" className="diagram rounded-xl border border-line" role="img" aria-label={s.title}>
        <rect width="400" height="260" fill="var(--land)" />
        {/* River B's valley (wide) */}
        <path d="M120,0 L120,260" stroke="#a16207" strokeOpacity="0.15" strokeWidth="40" />
        {/* watershed */}
        <path d={captured ? "M190,0 Q185,60 165,80 M165,120 Q190,170 195,260" : "M190,0 Q170,130 195,260"} fill="none" stroke="#92400e" strokeWidth="2" strokeDasharray="7 5" />
        <text x="196" y="18" fontSize="10" fontWeight="700" style={{ fill: "#92400e" }}>watershed</text>
        {/* sea on the right */}
        <rect x="370" y="0" width="30" height="260" fill="var(--water)" fillOpacity="0.5" />
        <text x="385" y="250" fontSize="9" textAnchor="middle" fontWeight="700" transform="rotate(-90 385 250)">sea</text>
        {/* River B upper */}
        <path d="M120,0 Q126,50 120,100" fill="none" stroke="var(--water)" strokeWidth="4" />
        {/* River B lower */}
        {!captured && <path d="M120,100 Q112,180 120,260" fill="none" stroke="var(--water)" strokeWidth="4" />}
        {captured && <path d="M120,100 Q116,130 118,150" fill="none" stroke="var(--water)" strokeOpacity="0.25" strokeWidth="3" strokeDasharray="2 5" />}
        {captured && <path d="M118,160 Q112,200 120,260" fill="none" stroke="var(--water)" strokeWidth="2" />}
        {/* River A */}
        <path d={`M${s.headX},${captured ? 100 : 104} Q${(s.headX + 370) / 2},${captured ? 108 : 112} 370,118`} fill="none" stroke="var(--water)" strokeWidth={captured ? 6 : 4} />
        {!captured && <circle cx={s.headX} cy="104" r="4" fill="var(--danger)" />}
        <text x="300" y="104" fontSize="11" fontWeight="800">River A{captured ? " (captor)" : ""}</text>
        <text x="60" y="40" fontSize="11" fontWeight="800">River B</text>
        {i === 1 && <text x={s.headX + 6} y="94" fontSize="9" style={{ fill: "var(--danger)" }} fontWeight="700">← headward erosion</text>}
        {captured && (
          <g fontSize="9" fontWeight="700">
            <circle cx="120" cy="100" r="7" fill="none" stroke="var(--danger)" strokeWidth="2" />
            <text x="132" y="92" style={{ fill: "var(--danger)" }}>elbow of capture</text>
            <text x="40" y="70">captured stream ↓</text>
          </g>
        )}
        {i === 3 && (
          <g fontSize="9" fontWeight="700">
            <text x="128" y="134">wind gap (dry)</text>
            <text x="128" y="210">misfit stream</text>
            <text x="20" y="235" className="muted">valley too wide for it</text>
          </g>
        )}
      </svg>
      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" role="status">
        <div className="mb-1 font-display font-bold">{s.title}</div>
        <Md text={s.text} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex flex-1 justify-center gap-1">{STAGES.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Stage ${k + 1}`} className={`h-2 w-8 rounded-full ${k === i ? "bg-geomorph" : "bg-surface-2"}`} />)}</div>
        <Button size="sm" onClick={() => setI(Math.min(STAGES.length - 1, i + 1))} disabled={i === STAGES.length - 1}>Next <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </WidgetFrame>
  );
}
