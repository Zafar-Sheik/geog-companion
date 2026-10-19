"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Segmented, WidgetFrame } from "./widget-frame";

const ZONES = [
  { name: "Rural", x: 0.06, base: 0, h: 4 },
  { name: "Suburbs", x: 0.22, base: 0.45, h: 14 },
  { name: "CBD", x: 0.5, base: 1, h: 46 },
  { name: "Park", x: 0.66, base: 0.35, h: 0 },
  { name: "Suburbs", x: 0.8, base: 0.45, h: 14 },
  { name: "Rural", x: 0.95, base: 0, h: 4 },
];

const STRATEGIES = [
  "Plant trees and create parks / green belts (shade + evapotranspiration)",
  "Green roofs and green walls",
  "Light-coloured, reflective roofs and roads (higher albedo)",
  "Use public transport, cycling and car-pooling (less exhaust heat & pollution)",
  "Cleaner industry and stricter emission laws",
  "Design streets to let wind flow through (ventilation corridors)",
];

/** Urban heat island: the city is warmer than the surrounding countryside, especially on calm, clear nights. */
export function UrbanHeat() {
  const [green, setGreen] = useState(20);
  const [density, setDensity] = useState(70);
  const [traffic, setTraffic] = useState(60);
  const [wind, setWind] = useState(10);
  const [time, setTime] = useState<"night" | "day">("night");
  const [dome, setDome] = useState(true);

  const intensity = Math.max(0.5, (density / 100) * 4 + (traffic / 100) * 2.5 - (green / 100) * 3 - (wind / 40) * 3 + (time === "night" ? 2 : 0.5));
  const temp = (x: number) => {
    // smooth curve through zone bases
    let v = 0;
    let wsum = 0;
    for (const z of ZONES) {
      const w = Math.exp(-(((x - z.x) / 0.09) ** 2));
      v += w * z.base * (z.name === "Park" ? Math.max(0.15, 0.6 - green / 100) / 0.6 : 1);
      wsum += w;
    }
    return 14 + (v / Math.max(wsum, 0.0001)) * intensity;
  };
  const W = 400;
  const path = Array.from({ length: 81 }, (_, i) => i / 80).map((x, i) => `${i ? "L" : "M"}${x * W},${120 - (temp(x) - 13) * 9}`).join(" ");
  const peak = Math.max(...Array.from({ length: 81 }, (_, i) => temp(i / 80)));

  return (
    <WidgetFrame title="Urban heat island simulator" instruction="Change the city and the weather – watch the temperature profile from countryside to CBD." colour="var(--t-climate)">
      <svg viewBox={`0 0 ${W} 220`} className="diagram rounded-xl border border-line" role="img" aria-label={`Temperature profile across a city, CBD about ${(peak - 14).toFixed(1)} °C warmer than rural areas`}>
        <rect width={W} height="220" fill={time === "night" ? "#0f172a" : "#e0f2fe"} />
        <path d={path} fill="none" stroke="#ef4444" strokeWidth="3" />
        <text x="6" y="16" fontSize="10" style={{ fill: time === "night" ? "#fca5a5" : "#b91c1c" }} fontWeight="700">Temperature profile (°C)</text>
        <text x={W / 2} y={120 - (peak - 13) * 9 - 6} fontSize="11" textAnchor="middle" fontWeight="800" style={{ fill: "#ef4444" }}>{peak.toFixed(1)} °C</text>
        <text x={W * 0.06} y={120 - 1 * 9 - 6} fontSize="10" textAnchor="middle" style={{ fill: time === "night" ? "#cbd5e1" : "#334155" }}>14 °C</text>
        {dome && <path d={`M40,200 Q200,${150 - density * 0.5 - traffic * 0.3 + wind * 2} 360,200`} fill="#a8a29e" fillOpacity={0.15 + traffic / 400} stroke="#a8a29e" strokeDasharray="4 3" />}
        {dome && <text x="200" y={182 - density * 0.25} fontSize="9" textAnchor="middle" style={{ fill: time === "night" ? "#d6d3d1" : "#57534e" }}>pollution dome</text>}
        <rect x="0" y="200" width={W} height="20" fill="#65a30d" />
        {ZONES.map((z, i) => (
          <g key={i}>
            {z.name === "Park" ? (
              <>{[0, 1, 2].map((k) => <circle key={k} cx={z.x * W - 12 + k * 12} cy={194} r={6 + (green / 100) * 4} fill="#16a34a" />)}</>
            ) : z.h > 0 && (
              <>{[-1, 0, 1].map((k) => { const h = z.h * (0.5 + density / 100) * (k === 0 ? 1 : 0.7); return <rect key={k} x={z.x * W + k * 16 - 6} y={200 - h} width="12" height={h} fill="#64748b" />; })}</>
            )}
            <text x={z.x * W} y="214" fontSize="9" textAnchor="middle" style={{ fill: "#f7fee7" }} fontWeight="700">{z.name}</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <label>🌳 Green space & vegetation: <strong>{green}%</strong><input type="range" min={0} max={100} value={green} onChange={(e) => setGreen(Number(e.target.value))} className="w-full accent-[var(--success)]" /></label>
        <label>🏢 Building density & tall buildings: <strong>{density}%</strong><input type="range" min={0} max={100} value={density} onChange={(e) => setDensity(Number(e.target.value))} className="w-full accent-[var(--text-muted)]" /></label>
        <label>🚗 Traffic & industry (heat + pollution): <strong>{traffic}%</strong><input type="range" min={0} max={100} value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="w-full accent-[var(--danger)]" /></label>
        <label>💨 Wind speed: <strong>{wind} km/h</strong><input type="range" min={0} max={40} value={wind} onChange={(e) => setWind(Number(e.target.value))} className="w-full accent-[var(--t-climate)]" /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Segmented options={[{ id: "night", label: "Calm, clear night" }, { id: "day", label: "Daytime" }]} value={time} onChange={setTime} colour="var(--t-climate)" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dome} onChange={(e) => setDome(e.target.checked)} className="accent-[var(--t-climate)]" /> Show pollution dome</label>
      </div>
      <div className={cn("mt-3 rounded-xl p-3 text-sm", peak - 14 > 4 ? "bg-danger/10" : "bg-success/10")} role="status">
        The CBD is <strong>{(peak - 14).toFixed(1)} °C warmer</strong> than the countryside.{" "}
        {time === "night" ? "Heat islands are strongest at night: concrete, tar and bricks store heat during the day and release it slowly after sunset." : "During the day the difference is smaller."}{" "}
        {wind > 25 && "Strong wind mixes the air and weakens the heat island. "}
        {green > 60 && "Lots of vegetation cools the city through shade and evapotranspiration. "}
      </div>
      <details className="mt-3 rounded-xl border border-line p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Causes &amp; sustainable strategies</summary>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <ul className="list-disc space-y-1 pl-5">
            <li>Dark surfaces (tar, concrete) have a <strong>low albedo</strong> and absorb heat</li>
            <li>Buildings store heat and release it at night</li>
            <li>Tall buildings trap heat and <strong>reduce wind</strong> (urban canyons)</li>
            <li>Little vegetation → less evapotranspiration (cooling)</li>
            <li><strong>Artificial heat</strong> from cars, factories, air-conditioners, people</li>
            <li>Pollution dome traps outgoing long-wave radiation</li>
            <li>Drains remove rainwater quickly – less evaporative cooling</li>
          </ul>
          <ul className="list-disc space-y-1 pl-5">{STRATEGIES.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </details>
    </WidgetFrame>
  );
}
