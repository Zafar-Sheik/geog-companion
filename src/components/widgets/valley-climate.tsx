"use client";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Md, WidgetFrame } from "./widget-frame";

const INFO: Record<string, string> = {
  anabatic: "**Anabatic wind (day):** the sun heats the valley **slopes** faster than the air at the same height over the valley. The warm air on the slopes **expands, becomes less dense and rises up the slopes**. It can form cumulus clouds over the peaks in the afternoon.",
  katabatic: "**Katabatic wind (night):** the slopes **lose heat quickly by radiation** and cool the air touching them. Cold air is **dense and heavy**, so it **sinks and drains down the slopes** under gravity into the valley floor.",
  pocket: "**Frost pocket:** cold air collects on the **valley floor**. Temperatures can fall below 0 °C → **frost**. Bad for crops (and for people living there) – farmers avoid planting frost-sensitive crops here.",
  inversion: "**Temperature inversion:** normally temperature **drops** with height (about 6.5 °C per km). At night the cold air on the valley floor is trapped **under warmer air** – temperature **increases** with height up to the inversion layer. Smoke and **pollution are trapped** under it; **radiation fog** can form.",
  belt: "**Thermal belt:** the **middle slopes**, above the inversion layer, stay **warmer** at night than the valley floor. Frost-free → ideal for **orchards, vineyards** and **settlements**.",
  aspect: "**Aspect:** in the **Southern Hemisphere** the sun is in the **northern** sky, so **north-facing slopes** get more direct sunlight → warmer and drier; **south-facing slopes** are cooler and shadier (snow lasts longer). Farmers and home-builders prefer north-facing slopes.",
  fog: "**Radiation fog:** on clear, calm nights the cold valley-floor air cools to its **dew point** – water vapour **condenses** into fog. It clears in the morning when the sun heats the ground.",
};

export function ValleyClimate() {
  const [night, setNight] = useState(true);
  const [hit, setHit] = useState<string>("inversion");
  const H = (k: string) => ({ onClick: () => setHit(k), onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && setHit(k), tabIndex: 0, role: "button", style: { cursor: "pointer" } as const });
  const sky = night ? "#1e293b" : "#bae6fd";
  const ground = "M0,40 L60,70 L120,120 L170,190 L230,190 L280,120 L340,70 L400,40 L400,240 L0,240 Z";

  return (
    <WidgetFrame title="Valley climates: day and night" instruction="Toggle day/night and click the labels to find out what happens in a valley." colour="var(--t-climate)">
      <div className="mb-3 flex gap-2">
        <button onClick={() => { setNight(false); setHit("anabatic"); }} aria-pressed={!night} className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold", !night ? "bg-economic text-white" : "bg-surface-2 text-muted")}><Sun className="h-4 w-4" /> Day</button>
        <button onClick={() => { setNight(true); setHit("inversion"); }} aria-pressed={night} className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold", night ? "bg-climate text-white" : "bg-surface-2 text-muted")}><Moon className="h-4 w-4" /> Night</button>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <svg viewBox="0 0 400 240" className="diagram rounded-xl border border-line" role="img" aria-label={`Valley cross-section at ${night ? "night" : "day"}`}>
          <defs>
            <marker id="vc-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#dc2626" /></marker>
            <marker id="vc-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#3b82f6" /></marker>
          </defs>
          <rect width="400" height="240" fill={sky} />
          {night ? <text x="40" y="30" fontSize="18">🌙</text> : <g {...H("aspect")}><circle cx="40" cy="26" r="14" fill="#fbbf24" />{[300, 330].map((x) => <line key={x} x1="54" y1="30" x2={x} y2={x === 300 ? 105 : 80} stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 4" />)}</g>}
          <path d={ground} fill={night ? "#365314" : "#65a30d"} />
          <text x="70" y="16" fontSize="9" style={{ fill: night ? "#cbd5e1" : "#334155" }}>← North</text>
          <text x="392" y="16" fontSize="9" textAnchor="end" style={{ fill: night ? "#cbd5e1" : "#334155" }}>South →</text>
          {night && (
            <>
              <g {...H("belt")}>
                <path d="M88,98 L120,120 L134,140 M266,140 L280,120 L312,98" stroke="#f59e0b" strokeWidth="10" strokeOpacity="0.55" fill="none" />
                <text x="318" y="128" fontSize="10" fontWeight="700" style={{ fill: "#fbbf24" }}>thermal belt</text>
              </g>
              <g {...H("pocket")}><path d="M150,160 L250,160 L230,190 L170,190 Z" fill="#60a5fa" fillOpacity="0.55" /></g>
              <g {...H("fog")}>{[166, 174, 182].map((y) => <line key={y} x1="160" x2="240" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 4" />)}</g>
              <g {...H("inversion")}><line x1="120" y1="150" x2="280" y2="150" stroke="#f87171" strokeWidth="2" strokeDasharray="6 4" /><text x="200" y="145" fontSize="10" textAnchor="middle" fontWeight="700" style={{ fill: "#fca5a5" }}>inversion layer</text></g>
              <g {...H("katabatic")}>
                <line x1="70" y1="62" x2="140" y2="138" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#vc-blue)" />
                <line x1="330" y1="62" x2="260" y2="138" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#vc-blue)" />
                <text x="64" y="88" fontSize="10" fontWeight="700" style={{ fill: "#93c5fd" }} textAnchor="end">katabatic</text>
              </g>
              <text x="200" y="208" fontSize="10" textAnchor="middle" fontWeight="700" style={{ fill: "#dbeafe" }}>frost pocket</text>
            </>
          )}
          {!night && (
            <g {...H("anabatic")}>
              <line x1="160" y1="168" x2="78" y2="72" stroke="#dc2626" strokeWidth="3" markerEnd="url(#vc-red)" />
              <line x1="240" y1="168" x2="322" y2="72" stroke="#dc2626" strokeWidth="3" markerEnd="url(#vc-red)" />
              <text x="200" y="100" fontSize="10" textAnchor="middle" fontWeight="700" style={{ fill: "#b91c1c" }}>anabatic winds rise</text>
              <path d="M40,30 Q60,10 80,28 Q100,14 112,32 Z" fill="white" opacity="0.8" />
            </g>
          )}
          <g {...H("aspect")}>
            <text x="340" y="150" fontSize="9" fontWeight="700" style={{ fill: "#fef3c7" }} textAnchor="middle">north-facing</text>
            <text x="60" y="150" fontSize="9" fontWeight="700" style={{ fill: "#e0f2fe" }} textAnchor="middle">south-facing</text>
          </g>
        </svg>
        <div>
          <svg viewBox="0 0 160 160" className="diagram max-w-[220px]" role="img" aria-label="Temperature against height graph">
            <line x1="20" y1="10" x2="20" y2="140" stroke="var(--text-muted)" />
            <line x1="20" y1="140" x2="155" y2="140" stroke="var(--text-muted)" />
            <text x="6" y="80" fontSize="8" transform="rotate(-90 6 80)" textAnchor="middle" className="muted">height</text>
            <text x="88" y="154" fontSize="8" textAnchor="middle" className="muted">temperature →</text>
            {night ? (
              <path d="M40,140 L95,90 L60,20" fill="none" stroke="#3b82f6" strokeWidth="3" />
            ) : (
              <path d="M130,140 L50,20" fill="none" stroke="#dc2626" strokeWidth="3" />
            )}
            {night && <text x="98" y="92" fontSize="8" style={{ fill: "#f87171" }}>inversion</text>}
          </svg>
          <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm" role="status"><Md text={INFO[hit]} /></div>
        </div>
      </div>
    </WidgetFrame>
  );
}
