"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Spin } from "./fronts";
import { Feedback, Md, Segmented, WidgetFrame } from "./widget-frame";

type Tab = "anatomy" | "stages" | "conditions" | "danger";

const STAGES = [
  { name: "Formative", wind: "< 63 km/h", text: "A **tropical disturbance** over warm sea becomes a **tropical depression**: pressure starts to fall, warm moist air rises and clouds begin to organise around a centre.", r: 22, eye: false },
  { name: "Immature", wind: "63–118 km/h", text: "Now a **tropical storm** – it is **given a name**. Pressure keeps dropping, winds strengthen and **spiral rain bands** form as air spirals in.", r: 36, eye: false },
  { name: "Mature", wind: "≥ 119 km/h", text: "A full **tropical cyclone**. A calm, clear **eye** forms, surrounded by the **eye wall** (strongest winds, heaviest rain). Pressure is at its **lowest** (often below 950 hPa) and the system is at its **largest** (up to 600 km across).", r: 52, eye: true },
  { name: "Dissipating", wind: "weakening", text: "The cyclone moves **over land** or **cooler water**: it is cut off from its supply of **moisture and latent heat**, **friction** with the land slows the winds, the low **fills** and the cyclone dies – but it can still cause **floods** far inland.", r: 40, eye: false },
];

const CONDITIONS = [
  { text: "Sea surface temperature of at least 26.5 °C", needed: true },
  { text: "Between about 5° and 25° from the equator (Coriolis force)", needed: true },
  { text: "Warm, very moist (humid) air above the sea", needed: true },
  { text: "Low wind shear (winds at all heights blow at similar speeds)", needed: true },
  { text: "Upper-air divergence (air spreads out at the top)", needed: true },
  { text: "Directly over the equator", needed: false },
  { text: "Cold ocean current offshore", needed: false },
];

/** Pie slice centred on compass bearing c (degrees), 90° wide. */
function quadPath(c: number) {
  const pt = (b: number) => `${(100 + 90 * Math.sin((b * Math.PI) / 180)).toFixed(1)},${(100 - 90 * Math.cos((b * Math.PI) / 180)).toFixed(1)}`;
  return `M100,100 L${pt(c - 45)} A90,90 0 0 1 ${pt(c + 45)} Z`;
}

function PlanView({ clockwise, radius = 52, eye = true }: { clockwise: boolean; radius?: number; eye?: boolean }) {
  const arms = [0, 120, 240];
  const spiral = (rot: number) => {
    const pts: string[] = [];
    for (let k = 0; k <= 40; k++) {
      const a = (rot * Math.PI) / 180 + (k / 40) * Math.PI * 1.4 * (clockwise ? 1 : -1);
      const r = 8 + (k / 40) * radius * 1.7;
      pts.push(`${(k ? "L" : "M") + (100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <svg viewBox="0 0 200 200" className="diagram mx-auto max-w-[260px]" role="img" aria-label={`Plan view of a tropical cyclone spinning ${clockwise ? "clockwise" : "anticlockwise"}`}>
      <circle cx="100" cy="100" r="96" fill="color-mix(in oklab, var(--water) 18%, var(--surface))" />
      <circle cx="100" cy="100" r={radius + 18} fill="#cbd5e1" fillOpacity="0.45" />
      {arms.map((a) => <path key={a} d={spiral(a)} fill="none" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />)}
      {arms.map((a) => <path key={`w${a}`} d={spiral(a)} fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />)}
      {eye ? (
        <>
          <circle cx="100" cy="100" r="16" fill="#e2e8f0" stroke="#64748b" strokeWidth="5" />
          <circle cx="100" cy="100" r="9" fill="color-mix(in oklab, var(--water) 40%, var(--surface))" />
        </>
      ) : <circle cx="100" cy="100" r="10" fill="#cbd5e1" />}
      <Spin cx={100} cy={100} r={radius + 24} clockwise={clockwise} colour="var(--danger)" />
    </svg>
  );
}

function CrossSection() {
  const [hit, setHit] = useState<string | null>(null);
  const parts: Record<string, string> = {
    eye: "**Eye** – 10–50 km wide. **Air sinks** and warms, so it is **calm, clear and dry** with the **lowest pressure**. Many people think the storm is over when the eye passes – then the other eye wall hits.",
    wall: "**Eye wall** – a ring of towering **cumulonimbus** clouds where warm moist air **rises fastest**. **Strongest winds** (can exceed 200 km/h) and **heaviest rain**. Latent heat released here powers the cyclone.",
    bands: "**Spiral rain bands** – bands of cumulonimbus spiralling in towards the centre, bringing heavy showers and gusts with calmer gaps in between.",
    outflow: "**Outflow / cirrus shield** – at the top (about 12–15 km) air spreads **outwards** (upper-air divergence), forming a sheet of cirrus cloud. Divergence keeps surface pressure low.",
    surge: "**Storm surge** – low pressure and strong onshore winds raise the sea level at the coast, flooding low-lying areas. Often the most deadly hazard.",
  };
  const H = (k: string) => ({ onClick: () => setHit(k), onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && setHit(k), tabIndex: 0, role: "button", style: { cursor: "pointer" } });
  return (
    <div>
      <svg viewBox="0 0 400 190" className="diagram rounded-xl border border-line" role="img" aria-label="Cross-section through a tropical cyclone – click a part">
        <rect width="400" height="190" fill="color-mix(in oklab, var(--t-climate) 6%, var(--surface))" />
        <g {...H("outflow")}><path d="M20,30 Q200,8 380,30 L380,40 Q200,22 20,40 Z" fill="#e2e8f0" stroke="#94a3b8" /><text x="200" y="22" fontSize="9" textAnchor="middle">outflow (cirrus shield) ← →</text></g>
        <g {...H("bands")}>
          {[50, 95, 305, 350].map((x) => <path key={x} d={`M${x - 18},150 Q${x - 20},95 ${x},88 Q${x + 20},95 ${x + 18},150 Z`} fill="#cbd5e1" stroke="#94a3b8" />)}
          <text x="72" y="80" fontSize="9" textAnchor="middle">rain bands</text>
        </g>
        <g {...H("wall")}>
          <path d="M150,150 Q140,60 172,38 L186,38 L186,150 Z" fill="#94a3b8" />
          <path d="M250,150 Q260,60 228,38 L214,38 L214,150 Z" fill="#94a3b8" />
          <text x="142" y="70" fontSize="9" textAnchor="end">eye wall</text>
        </g>
        <g {...H("eye")}>
          <rect x="186" y="38" width="28" height="112" fill="color-mix(in oklab, var(--water) 10%, var(--surface))" />
          <path d="M200,50 L200,130" stroke="var(--danger)" strokeWidth="2" markerEnd="url(#tc-down)" />
          <text x="200" y="170" fontSize="10" textAnchor="middle" fontWeight="700">eye</text>
        </g>
        <defs><marker id="tc-down" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,0 L5,10 z" fill="var(--danger)" /></marker></defs>
        <path d="M20,146 L140,146" stroke="var(--t-climate)" strokeWidth="2" markerEnd="url(#arr-tc)" />
        <path d="M380,146 L260,146" stroke="var(--t-climate)" strokeWidth="2" markerEnd="url(#arr-tc)" />
        <defs><marker id="arr-tc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--t-climate)" /></marker></defs>
        <g {...H("surge")}><rect x="0" y="150" width="400" height="40" fill="color-mix(in oklab, var(--water) 45%, var(--surface))" /><path d="M150,150 Q200,138 250,150" fill="color-mix(in oklab, var(--water) 60%, var(--surface))" /><text x="394" y="166" fontSize="9" textAnchor="end">warm ocean ≥ 26.5 °C</text><text x="200" y="186" fontSize="8" textAnchor="middle">sea bulge (storm surge)</text></g>
        <text x="80" y="140" fontSize="8" style={{ fill: "var(--t-climate)" }}>moist air spirals in</text>
      </svg>
      <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm" role="status">{hit ? <Md text={parts[hit]} /> : <p className="text-muted">Click any part of the diagram: eye, eye wall, rain bands, outflow or the sea.</p>}</div>
    </div>
  );
}

export function TropicalCyclone() {
  const [tab, setTab] = useState<Tab>("anatomy");
  const [hemi, setHemi] = useState<"S" | "N">("S");
  const [stage, setStage] = useState(2);
  const [conds, setConds] = useState<boolean[]>(CONDITIONS.map(() => false));
  const [checked, setChecked] = useState(false);
  const [quad, setQuad] = useState<string | null>(null);
  const condOk = CONDITIONS.every((c, i) => conds[i] === c.needed);

  return (
    <WidgetFrame title="Tropical cyclone lab" instruction="Explore how tropical cyclones are built, how they grow, what they need, and where they are most dangerous." colour="var(--t-climate)">
      <Segmented<Tab> options={[{ id: "anatomy", label: "Anatomy" }, { id: "stages", label: "Life cycle" }, { id: "conditions", label: "What it needs" }, { id: "danger", label: "Danger quadrant" }]} value={tab} onChange={setTab} colour="var(--t-climate)" />
      <div className="mt-4">
        {tab === "anatomy" && (
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div>
              <PlanView clockwise={hemi === "S"} />
              <div className="mt-2 flex justify-center"><Segmented options={[{ id: "S", label: "Southern Hem." }, { id: "N", label: "Northern Hem." }]} value={hemi} onChange={setHemi} colour="var(--t-climate)" /></div>
              <p className="mt-2 text-center text-sm">Spins <strong>{hemi === "S" ? "clockwise" : "anticlockwise"}</strong> – the Coriolis force deflects air to the {hemi === "S" ? "left" : "right"}.</p>
            </div>
            <CrossSection />
          </div>
        )}
        {tab === "stages" && (
          <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
            <PlanView clockwise radius={STAGES[stage].r} eye={STAGES[stage].eye} />
            <div>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s, i) => <button key={s.name} onClick={() => setStage(i)} aria-pressed={i === stage} className={cn("rounded-lg px-3 py-1.5 text-sm font-bold", i === stage ? "bg-climate text-white" : "bg-surface-2 text-muted")}>{i + 1}. {s.name}</button>)}
              </div>
              <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" role="status">
                <div className="mb-1 text-xs font-bold text-muted uppercase">Wind speed: {STAGES[stage].wind}</div>
                <Md text={STAGES[stage].text} />
              </div>
            </div>
          </div>
        )}
        {tab === "conditions" && (
          <div>
            <p className="mb-2 text-sm">Tick only the conditions a tropical cyclone <strong>needs</strong> to form:</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CONDITIONS.map((c, i) => (
                <li key={c.text}>
                  <label className={cn("flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-sm", checked && conds[i] !== c.needed ? "border-danger bg-danger/10" : checked ? "border-success/50" : "border-line")}>
                    <input type="checkbox" className="mt-0.5 accent-[var(--t-climate)]" checked={conds[i]} onChange={() => { setChecked(false); setConds((x) => x.map((v, k) => (k === i ? !v : v))); }} />
                    {c.text}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={() => setChecked(true)} className="mt-3 rounded-xl bg-climate px-4 py-2 text-sm font-semibold text-white">Can a cyclone form?</button>
            <Feedback ok={checked ? condOk : null}>
              {condOk ? "🌀 Yes! All the ingredients are there – the cyclone forms (usually in late summer, January to March, in the Mozambique Channel)." : "Not quite. On the equator the Coriolis force is zero, so air can't spin; a cold current cools the sea below 26.5 °C. Check the red ones."}
            </Feedback>
          </div>
        )}
        {tab === "danger" && (
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <svg viewBox="0 0 200 200" className="diagram" role="img" aria-label="Cyclone moving south-west with four quadrants – click the most dangerous one">
              <circle cx="100" cy="100" r="90" fill="color-mix(in oklab, var(--water) 15%, var(--surface))" stroke="var(--border)" />
              {([["lf", 180], ["rf", 270], ["lr", 90], ["rr", 0]] as const).map(([k, c]) => (
                <path key={k} d={quadPath(c)} fill={quad === k ? (k === "lf" ? "#16a34a" : "#dc2626") : "transparent"} fillOpacity="0.35" stroke="var(--text-muted)" strokeDasharray="3 3" style={{ cursor: "pointer" }} onClick={() => setQuad(k)} tabIndex={0} role="button" aria-label={{ lf: "Left front", rf: "Right front", lr: "Left rear", rr: "Right rear" }[k]} onKeyDown={(e) => e.key === "Enter" && setQuad(k)} />
              ))}
              <Spin cx={100} cy={100} r={60} clockwise colour="var(--t-climate)" />
              <circle cx="100" cy="100" r="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
              <line x1="130" y1="70" x2="62" y2="138" stroke="var(--danger)" strokeWidth="3" markerEnd="url(#tc-track)" />
              <defs><marker id="tc-track" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--danger)" /></marker></defs>
              <text x="140" y="60" fontSize="9" fontWeight="700" style={{ fill: "var(--danger)" }}>track</text>
            </svg>
            <div className="text-sm">
              <p>This Southern Hemisphere cyclone is moving <strong>south-west</strong> (towards Mozambique). Click the quadrant where winds are <strong>strongest and most destructive</strong>.</p>
              <Feedback ok={quad ? quad === "lf" : null}>
                {quad === "lf" ? (
                  <><strong>Correct – the left-front quadrant.</strong> In the Southern Hemisphere the winds spin clockwise. On the left of the track the wind blows in the <strong>same direction</strong> the cyclone is moving, so the two speeds <strong>add up</strong>. The front quadrants also hit the coast first, with the storm surge. (In the Northern Hemisphere it is the right-front quadrant.)</>
                ) : <>Not yet. Think: on which side does the clockwise wind blow in the same direction as the cyclone is travelling? Wind speed + forward speed = most damage.</>}
              </Feedback>
            </div>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}
