"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FrontLine, sampleQuad, Spin, type Pt } from "./fronts";
import { Md, Segmented, WidgetFrame } from "./widget-frame";

const H = 260;

interface Stage {
  name: string;
  low?: Pt;
  warm?: [Pt, Pt, Pt];
  cold?: [Pt, Pt, Pt];
  occluded?: [Pt, Pt, Pt];
  sector?: Pt[];
  text: string;
}

const STAGES: Stage[] = [
  {
    name: "1. Initial stage",
    text: "Along the **polar front** (about 60° S) **cold, dense polar air** (polar easterlies) meets **warm, moist subtropical air** (westerlies). The two air masses move in **opposite directions** alongside each other – friction and the contrast in temperature create an unstable boundary.",
  },
  {
    name: "2. Wave (infant) stage",
    low: [200, 172],
    warm: [[200, 172], [262, 132], [380, 122]],
    cold: [[200, 172], [146, 134], [20, 124]],
    sector: [[200, 172], [262, 132], [380, 122], [380, 60], [20, 60], [20, 124], [146, 134]],
    text: "A **kink (wave)** forms in the front. Warm air pushes **poleward (south)** into the cold air and pressure starts to drop – a **low** forms at the tip of the wave. Air begins to circulate **clockwise** (Southern Hemisphere). A **warm front** (leading, east) and a **cold front** (trailing, west) appear.",
  },
  {
    name: "3. Mature stage",
    low: [200, 205],
    warm: [[200, 205], [292, 152], [372, 92]],
    cold: [[200, 205], [128, 172], [62, 78]],
    sector: [[200, 205], [292, 152], [372, 92], [372, 40], [62, 40], [62, 78], [128, 172]],
    text: "The low **deepens** (pressure is lowest), isobars are close together and winds are strong. There is a large **warm sector** between the fronts. The whole system moves **eastwards** with the westerlies. Weather: **cirrus → altostratus → nimbostratus** and steady rain at the warm front; **cumulonimbus**, heavy showers, thunderstorms and a sharp temperature drop at the cold front.",
  },
  {
    name: "4. Occluded stage",
    low: [200, 215],
    occluded: [[200, 215], [228, 196], [252, 172]],
    warm: [[252, 172], [312, 132], [374, 96]],
    cold: [[252, 172], [192, 140], [134, 70]],
    sector: [[252, 172], [312, 132], [374, 96], [374, 40], [134, 40], [134, 70], [192, 140]],
    text: "The **cold front moves faster** than the warm front and **catches up** with it, starting at the low. The warm air is **lifted off the ground** – an **occluded front** forms. The warm sector gets smaller. Cloud and rain still occur along the occlusion.",
  },
  {
    name: "5. Dissipating stage",
    low: [210, 200],
    occluded: [[210, 200], [268, 172], [330, 108]],
    text: "All the warm air has been lifted from the surface – there is **no more warm sector**. With no supply of warm, moist air (its energy source) the low **fills up** (pressure rises), the fronts weaken and the cyclone **dies out**. Cold air now lies at the surface everywhere.",
  },
];

export function MlcLifecycle() {
  const [i, setI] = useState(0);
  const [hemi, setHemi] = useState<"S" | "N">("S");
  const s = STAGES[i];
  const m = (p: Pt): Pt => (hemi === "S" ? p : [p[0], H - p[1]]);
  const mq = (q: [Pt, Pt, Pt]) => sampleQuad(m(q[0]), m(q[1]), m(q[2]));
  const warmLabelY = hemi === "S" ? 28 : H - 18;
  const coldLabelY = hemi === "S" ? H - 14 : 24;

  return (
    <WidgetFrame title="Life cycle of a mid-latitude cyclone" instruction="Step through the five stages. Switch hemispheres to see why SA's maps look 'upside down' compared with textbooks from the north." colour="var(--t-climate)">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Segmented options={[{ id: "S", label: "Southern Hemisphere (SA)" }, { id: "N", label: "Northern Hemisphere" }]} value={hemi} onChange={setHemi} colour="var(--t-climate)" />
        <span className="text-xs text-muted">Moving west → east</span>
      </div>
      <svg viewBox={`0 0 400 ${H}`} className="diagram rounded-xl border border-line" role="img" aria-label={`${s.name}, ${hemi === "S" ? "Southern" : "Northern"} Hemisphere`}>
        <defs>
          <linearGradient id="mlc-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hemi === "S" ? "#fde68a" : "#bfdbfe"} stopOpacity="0.35" />
            <stop offset="1" stopColor={hemi === "S" ? "#bfdbfe" : "#fde68a"} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <rect width="400" height={H} fill="url(#mlc-bg)" />
        <text x="10" y={warmLabelY} fontSize="11" fontWeight="700" style={{ fill: "#b45309" }}>Warm subtropical air → westerlies</text>
        <text x="10" y={coldLabelY} fontSize="11" fontWeight="700" style={{ fill: "#1d4ed8" }}>← Cold polar air · polar easterlies</text>
        <text x="390" y={hemi === "S" ? 16 : H - 6} fontSize="9" textAnchor="end" className="muted">{hemi === "S" ? "N ↑ equator" : "N ↑ pole"}</text>
        {i === 0 && (
          <g>
            <line x1="20" y1="130" x2="380" y2="130" stroke="#9333ea" strokeWidth="2.6" strokeDasharray="10 5" />
            <text x="200" y={hemi === "S" ? 122 : 146} textAnchor="middle" fontSize="11" fontWeight="700">polar front</text>
          </g>
        )}
        {s.sector && <polygon points={s.sector.map((p) => m(p).join(",")).join(" ")} fill="#f59e0b" fillOpacity="0.12" />}
        {s.sector && s.low && <text x={m(s.low)[0]} y={m([s.low[0], s.low[1] - 70])[1]} textAnchor="middle" fontSize="11" fontWeight="700" style={{ fill: "#b45309" }}>warm sector</text>}
        {s.warm && <FrontLine points={mq(s.warm)} kind="warm" facing={[1, 0]} />}
        {s.cold && <FrontLine points={mq(s.cold)} kind="cold" facing={[1, 0]} />}
        {s.occluded && <FrontLine points={mq(s.occluded)} kind="occluded" facing={[1, 0]} />}
        {s.low && (
          <g>
            {i >= 2 && [34, 54].map((r) => <ellipse key={r} cx={m(s.low!)[0]} cy={m(s.low!)[1]} rx={r * 1.4} ry={r * 0.8} fill="none" stroke="var(--text-muted)" strokeOpacity="0.35" />)}
            <Spin cx={m(s.low)[0]} cy={m(s.low)[1]} clockwise={hemi === "S"} r={18} />
            <text x={m(s.low)[0]} y={m(s.low)[1] + 7} textAnchor="middle" fontSize="20" fontWeight="800" style={{ fill: "var(--danger)" }}>L</text>
          </g>
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="inline-block h-0 w-0 border-x-[6px] border-b-[9px] border-x-transparent border-b-[#2563eb]" /> Cold front</span>
        <span className="flex items-center gap-1"><span className="inline-block h-[7px] w-[14px] rounded-t-full bg-[#dc2626]" /> Warm front</span>
        <span className="flex items-center gap-1"><span className="inline-block h-[7px] w-[14px] rounded-t-full bg-[#9333ea]" /> Occluded front</span>
        <span>Arrows show circulation: <strong>{hemi === "S" ? "clockwise" : "anticlockwise"}</strong> around a low</span>
      </div>
      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" role="status">
        <div className="mb-1 font-display font-bold">{s.name}</div>
        <Md text={s.text} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex flex-1 justify-center gap-1">{STAGES.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Stage ${k + 1}`} className={`h-2 w-8 rounded-full ${k === i ? "bg-climate" : "bg-surface-2"}`} />)}</div>
        <Button size="sm" onClick={() => setI(Math.min(STAGES.length - 1, i + 1))} disabled={i === STAGES.length - 1}>Next <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </WidgetFrame>
  );
}
