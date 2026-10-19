"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Md, Segmented, WidgetFrame } from "./widget-frame";

const W = 400;
const base = (x: number) => 230 - 190 * (1 - x / W) ** 2.4;

const COURSES = {
  upper: {
    label: "Upper course", range: [0, 130], valley: "M10,10 L70,110 L90,110 L150,10",
    text: "**Steep gradient**, fast-flowing, shallow, narrow channel. **Vertical (downward) erosion** dominates → **V-shaped valley**. Landforms: **waterfalls, rapids, potholes, interlocking spurs, gorges**. Load is large and angular (boulders).",
  },
  middle: {
    label: "Middle course", range: [130, 270], valley: "M5,30 L45,95 L105,105 L155,30",
    text: "Gentler gradient, more water (tributaries have joined). **Lateral (sideways) erosion** starts to widen the valley → **wider, open V**. Landforms: **meanders, river cliffs (undercut slopes), slip-off slopes, small floodplains**.",
  },
  lower: {
    label: "Lower course", range: [270, 400], valley: "M5,60 L20,95 L60,100 L64,94 L72,104 L88,104 L96,94 L100,100 L140,95 L155,60",
    text: "**Very gentle gradient**, deep wide channel, large volume but slow. **Deposition** dominates. Landforms: wide **floodplain**, **levées**, **oxbow lakes**, **meander scars**, **braided streams**, **deltas** and **estuaries** at the mouth. Fine load (silt, clay).",
  },
} as const;
type Course = keyof typeof COURSES;

/** Longitudinal profile, transverse profiles and rejuvenation. */
export function RiverProfile() {
  const [course, setCourse] = useState<Course>("upper");
  const [drop, setDrop] = useState(0);
  const [dam, setDam] = useState(false);
  const kx = W - drop * 5.5; // knickpoint retreats upstream as more time passes / larger drop
  const prof = (x: number) => (drop && x > kx ? base(x) + drop * ((x - kx) / (W - kx)) ** 0.45 : base(x));
  const pts = Array.from({ length: 101 }, (_, i) => (i / 100) * W);
  const path = pts.map((x, i) => `${i ? "L" : "M"}${x},${prof(x)}`).join(" ");
  const c = COURSES[course];

  return (
    <WidgetFrame title="River profiles & rejuvenation" instruction="Pick a section of the river to see its transverse profile. Then lower the sea level to rejuvenate the river." colour="var(--t-geomorph)">
      <svg viewBox={`0 0 ${W} 280`} className="diagram rounded-xl border border-line" role="img" aria-label="Longitudinal profile of a river">
        <rect width={W} height="280" fill="color-mix(in oklab, var(--t-geomorph) 4%, var(--surface))" />
        {(Object.keys(COURSES) as Course[]).map((k) => (
          <rect key={k} x={COURSES[k].range[0]} y="0" width={COURSES[k].range[1] - COURSES[k].range[0]} height="280" fill={k === course ? "var(--t-geomorph)" : "transparent"} fillOpacity="0.08" style={{ cursor: "pointer" }} onClick={() => setCourse(k)} />
        ))}
        <path d={`${path} L${W},280 L0,280 Z`} fill="#a16207" fillOpacity="0.25" />
        {drop > 0 && <path d={pts.map((x, i) => `${i ? "L" : "M"}${x},${base(x)}`).join(" ")} fill="none" stroke="var(--text-muted)" strokeDasharray="4 4" />}
        <path d={path} fill="none" stroke="var(--water)" strokeWidth="3" />
        <line x1={W - 40} y1={230 + drop} x2={W} y2={230 + drop} stroke="var(--water)" strokeWidth="6" />
        <text x={W - 4} y={224 + drop} fontSize="9" textAnchor="end" fontWeight="700">{drop ? "new base level" : "sea level (base level)"}</text>
        {drop > 0 && <line x1={W - 40} y1="230" x2={W} y2="230" stroke="var(--water)" strokeOpacity="0.4" strokeDasharray="3 3" />}
        {drop > 0 && (
          <g>
            <circle cx={kx} cy={prof(kx)} r="5" fill="var(--danger)" />
            <text x={kx - 6} y={prof(kx) - 10} fontSize="10" fontWeight="700" textAnchor="end" style={{ fill: "var(--danger)" }}>knickpoint (waterfall)</text>
          </g>
        )}
        {dam && (
          <g>
            <rect x="196" y={base(200) - 26} width="8" height="28" fill="#475569" />
            <path d={`M120,${base(120)} L196,${base(200) - 20} L196,${base(200)} Z`} fill="var(--water)" fillOpacity="0.4" />
            <text x="150" y={base(150) - 24} fontSize="9" textAnchor="middle" fontWeight="700">dam = temporary base level</text>
            <text x="150" y={base(150) + 18} fontSize="8" textAnchor="middle">deposition ↑</text>
            <text x="250" y={base(250) + 18} fontSize="8" textAnchor="middle">erosion ↓ (clear water)</text>
          </g>
        )}
        <text x="6" y="36" fontSize="10" fontWeight="700">source</text>
        <text x="60" y="270" fontSize="10" textAnchor="middle" fontWeight="700">{COURSES.upper.label}</text>
        <text x="200" y="270" fontSize="10" textAnchor="middle" fontWeight="700">{COURSES.middle.label}</text>
        <text x="335" y="270" fontSize="10" textAnchor="middle" fontWeight="700">{COURSES.lower.label}</text>
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[180px_1fr]">
        <div>
          <Segmented options={(Object.keys(COURSES) as Course[]).map((k) => ({ id: k, label: COURSES[k].label.split(" ")[0] }))} value={course} onChange={setCourse} colour="var(--t-geomorph)" />
          <svg viewBox="0 0 160 120" className="diagram mt-2 rounded-lg border border-line" role="img" aria-label={`Transverse profile of the ${c.label}`}>
            <path d={`${c.valley} L155,120 L5,120 Z`} fill="#a16207" fillOpacity="0.3" stroke="#a16207" />
            <text x="80" y="116" fontSize="9" textAnchor="middle" className="muted">transverse profile</text>
          </svg>
        </div>
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-surface-2 p-3" role="status"><Md text={c.text} /></div>
          <label className="block">Drop in base level (sea level falls or land is uplifted): <strong>{drop} m</strong>
            <input type="range" min={0} max={40} value={drop} onChange={(e) => setDrop(Number(e.target.value))} className="w-full accent-[var(--t-geomorph)]" />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={dam} onChange={(e) => setDam(e.target.checked)} className="accent-[var(--t-geomorph)]" /> Build a dam (temporary base level)</label>
          <div className={cn("rounded-xl p-3", drop ? "bg-geomorph/10" : "bg-surface-2")}>
            {drop ? (
              <Md text="**Rejuvenation:** the river has more **potential energy** – it starts to **erode vertically** again from the mouth upwards. A **knickpoint** (break of slope, often a **waterfall/rapids**) forms and **retreats upstream**. Other landforms: **incised (entrenched) meanders**, **river terraces** (remains of the old floodplain) and a **two-cycle valley** (valley-in-a-valley)." />
            ) : (
              <Md text="A **graded profile** is smooth and concave – the river is in **equilibrium**: erosion and deposition are balanced. The lowest level a river can erode to is its **base level** (usually sea level)." />
            )}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
