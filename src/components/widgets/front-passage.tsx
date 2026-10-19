"use client";
import { useState } from "react";
import { Md, WidgetFrame } from "./widget-frame";

/** Time runs 0 → 100; the cold front passes the station at t = 50. */
const FRONT = 50;

function weather(t: number) {
  const before = t < FRONT - 4;
  const at = Math.abs(t - FRONT) <= 4;
  const temp = t < FRONT ? 17 + (t / FRONT) * 5 : t < FRONT + 6 ? 22 - ((t - FRONT) / 6) * 11 : 11 - ((t - FRONT - 6) / 44) * 2;
  const pressure = t < FRONT ? 1016 - (t / FRONT) * 10 : 1006 + ((t - FRONT) / 50) * 14;
  const wind = t < FRONT - 10 ? "North-west (NW)" : t < FRONT ? "North-west, strengthening" : t < FRONT + 8 ? "Gusty – backing to south-west (SW)" : "South-west to south (SW–S)";
  const cloud = t < 20 ? "Clear to a few high cirrus" : before ? "Cloud thickening – towering cumulus" : at ? "Cumulonimbus – dark, towering" : t < 75 ? "Broken cumulus, scattered showers" : "Clearing skies";
  const rain = at ? "Heavy rain, thunderstorms, possible hail" : t > FRONT && t < 75 ? "Light showers; snow on high mountains" : "None";
  const phase = t < FRONT - 4 ? "pre" : at ? "at" : "post";
  return { temp, pressure, wind, cloud, rain, phase };
}

const PHASE_TEXT: Record<string, string> = {
  pre: "**Before the front:** warm, moist **north-westerly** air from the warm sector. **Pressure falls** as the low approaches. Sometimes **berg wind** conditions make it unusually hot and dry just before the front.",
  at: "**As the front passes:** cold, dense air **undercuts** the warm air and forces it to rise **rapidly** → **cumulonimbus** clouds, **heavy rain**, **thunderstorms**, gusty winds. Temperature **drops sharply** and the wind **backs** (turns anticlockwise) from NW to SW.",
  post: "**After the front:** cold, dry **south-westerly** polar air. **Pressure rises** (high pressure ridges in behind). Skies clear, temperatures stay low, **snow** may fall on mountains and **frost** forms on clear nights.",
};

/** A station (e.g. Cape Town) experiencing a cold front over 2–3 days. */
export function FrontPassage() {
  const [t, setT] = useState(20);
  const w = weather(t);
  const W = 400;
  const chartH = 110;
  const xs = Array.from({ length: 101 }, (_, i) => i);
  const tPath = xs.map((x) => `${x ? "L" : "M"}${(x / 100) * W},${chartH - ((weather(x).temp - 8) / 16) * (chartH - 10)}`).join(" ");
  const pPath = xs.map((x) => `${x ? "L" : "M"}${(x / 100) * W},${chartH - ((weather(x).pressure - 1004) / 18) * (chartH - 10)}`).join(" ");
  // cross-section: the cold-air wedge moves from west (left) to east (right) as t increases
  const frontX = 200 + (t - FRONT) * 3.2;

  return (
    <WidgetFrame title="A cold front passes Cape Town" instruction="Drag the time slider and watch what the weather station records before, during and after the cold front." colour="var(--t-climate)">
      <svg viewBox="0 0 400 150" className="diagram rounded-xl border border-line" role="img" aria-label="Cross-section of a cold front passing a weather station">
        <rect width="400" height="150" fill="color-mix(in oklab, var(--t-climate) 8%, var(--surface))" />
        <text x="8" y="14" fontSize="10" className="muted">West</text>
        <text x="392" y="14" fontSize="10" textAnchor="end" className="muted">East →</text>
        {/* cold air wedge behind (west of) the front */}
        <path d={`M${frontX - 400},130 L${frontX},130 Q${frontX - 40},70 ${frontX - 180},30 L${frontX - 400},30 Z`} fill="#3b82f6" fillOpacity="0.28" />
        <text x={Math.max(14, frontX - 150)} y="110" fontSize="10" fontWeight="700" style={{ fill: "#1d4ed8" }}>cold polar air</text>
        <text x={Math.min(320, Math.max(220, frontX + 30))} y="110" fontSize="10" fontWeight="700" style={{ fill: "#b45309" }}>warm moist air</text>
        {/* cumulonimbus at the front */}
        <g transform={`translate(${frontX - 30}, 26)`}>
          <path d="M0,40 Q-6,20 12,18 Q14,0 34,6 Q50,-6 62,12 Q80,14 74,40 Z" fill="#94a3b8" />
          <path d="M8,42 L4,58 M24,42 L20,60 M40,42 L36,58 M56,42 L52,60" stroke="#2563eb" strokeWidth="2" />
        </g>
        <line x1={frontX} y1="130" x2={frontX - 60} y2="60" stroke="#2563eb" strokeWidth="2.5" />
        {/* station */}
        <rect x="0" y="130" width="400" height="20" fill="var(--land)" />
        <g transform="translate(200,130)">
          <line x1="0" y1="0" x2="0" y2="-22" stroke="var(--map-ink)" strokeWidth="2" />
          <circle cx="0" cy="-24" r="4" fill="var(--danger)" />
          <text x="0" y="14" fontSize="10" textAnchor="middle" fontWeight="700">Cape Town station</text>
        </g>
      </svg>
      <label className="mt-3 block">
        <span className="sr-only">Time</span>
        <input type="range" min={0} max={100} value={t} onChange={(e) => setT(Number(e.target.value))} className="w-full accent-[var(--t-climate)]" aria-label="Time" />
        <div className="flex justify-between text-xs text-muted"><span>Day 1</span><span>front arrives</span><span>Day 3</span></div>
      </label>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.1fr]">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[["🌡️ Temperature", `${w.temp.toFixed(0)} °C`], ["⏲️ Pressure", `${w.pressure.toFixed(0)} hPa`], ["🧭 Wind", w.wind], ["☁️ Cloud", w.cloud], ["🌧️ Precipitation", w.rain]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-2 p-2"><dt className="text-xs text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        <div>
          <svg viewBox={`0 0 ${W} ${chartH + 14}`} className="diagram" role="img" aria-label="Temperature and pressure graph over time">
            <line x1={(FRONT / 100) * W} y1="0" x2={(FRONT / 100) * W} y2={chartH} stroke="#2563eb" strokeDasharray="4 3" />
            <path d={tPath} fill="none" stroke="var(--danger)" strokeWidth="2.5" />
            <path d={pPath} fill="none" stroke="var(--t-climate)" strokeWidth="2.5" />
            <line x1={(t / 100) * W} y1="0" x2={(t / 100) * W} y2={chartH} stroke="var(--text)" strokeWidth="1.5" />
            <text x="4" y={chartH + 12} fontSize="10" style={{ fill: "var(--danger)" }} fontWeight="700">— temperature</text>
            <text x="120" y={chartH + 12} fontSize="10" style={{ fill: "var(--t-climate)" }} fontWeight="700">— air pressure</text>
          </svg>
          <div className="mt-2 rounded-xl border border-climate/30 bg-climate/5 p-3 text-sm" role="status"><Md text={PHASE_TEXT[w.phase]} /></div>
        </div>
      </div>
    </WidgetFrame>
  );
}
