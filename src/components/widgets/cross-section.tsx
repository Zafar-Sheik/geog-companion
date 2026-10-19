"use client";
import { useMemo, useState } from "react";
import { bumpStat } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Feedback, Md, Segmented, WidgetFrame } from "./widget-frame";

type HFn = (x: number, y: number) => number;
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const ASPECT = 400 / 260;
const r = (x: number, y: number, cx = 0.5, cy = 0.5) => Math.hypot((x - cx) * ASPECT, y - cy);

export const LANDFORMS: { id: string; name: string; h: HFn; text: string; river?: boolean }[] = [
  { id: "conical", name: "Conical hill", h: (x, y) => 1000 + 300 * Math.max(0, 1 - r(x, y) / 0.42), text: "**Conical hill:** roughly circular contours, **evenly spaced**, with the highest contour in the centre. The cross-section is a symmetrical cone." },
  { id: "spur", name: "Spur", h: (x, y) => 1300 - 230 * y - 200 * Math.abs(x - 0.5) ** 1.15, text: "**Spur:** a tongue of high land projecting into lower land. The contours form **V or U shapes that point towards LOWER ground** (the heights decrease towards the point of the V)." },
  { id: "valley", name: "Valley", river: true, h: (x, y) => 1000 + 200 * (1 - y) + 320 * Math.abs(x - 0.5) ** 1.1, text: "**Valley:** low land between higher ground, usually with a river. The contours form **V shapes that point towards HIGHER ground** (upstream)." },
  { id: "saddle", name: "Saddle", h: (x, y) => 1000 + 300 * (Math.exp(-((r(x, y, 0.28) / 0.22) ** 2)) + Math.exp(-((r(x, y, 0.72) / 0.22) ** 2))), text: "**Saddle (nek):** a **low point between two hills** – contours of the two hills almost join. Saddles are natural routes for roads and passes." },
  { id: "escarpment", name: "Escarpment / cliff", h: (x) => 1000 + 280 * sig((0.45 - x) * 38) + 20 * (1 - x), text: "**Escarpment / cliff:** contours **very close together (crowded)** – sometimes merging – showing a **very steep slope**. A gentle back slope has widely spaced contours." },
  { id: "mesa", name: "Mesa (flat-topped hill)", h: (x, y) => 1000 + 260 * sig((0.24 - r(x, y)) * 34), text: "**Mesa:** a flat-topped hill with steep sides – contours are **crowded around the edge** and there are **no contours on top** (a large flat area). A smaller one with a top narrower than its height is a **butte**." },
  { id: "concave", name: "Concave slope", h: (x) => 1000 + 300 * (1 - x) ** 2.4, text: "**Concave slope:** contours **close together near the top**, **far apart near the bottom** – steep at the top, gentle at the bottom. From the top you can see the bottom (intervisible)." },
  { id: "convex", name: "Convex slope", h: (x) => 1000 + 300 * (1 - x ** 2.4), text: "**Convex slope:** contours **far apart at the top** and **close together near the bottom** – gentle at the top, steep at the bottom. The top often **blocks the view** of the bottom (not intervisible)." },
];

const GX = 80;
const GY = 52;
const W = 400;
const H = 260;

function contours(h: HFn, levels: number[]) {
  const vals: number[][] = [];
  for (let j = 0; j <= GY; j++) {
    vals.push([]);
    for (let i = 0; i <= GX; i++) vals[j].push(h(i / GX, j / GY));
  }
  const out: { level: number; d: string }[] = [];
  const cw = W / GX;
  const ch = H / GY;
  for (const level of levels) {
    // trace just above the level so a perfectly flat base doesn't create jagged edges
    const c = level + 0.01;
    let d = "";
    for (let j = 0; j < GY; j++) {
      for (let i = 0; i < GX; i++) {
        const a = vals[j][i], b = vals[j][i + 1], cc = vals[j + 1][i + 1], dd = vals[j + 1][i];
        const idx = (a > c ? 8 : 0) | (b > c ? 4 : 0) | (cc > c ? 2 : 0) | (dd > c ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x0 = i * cw, y0 = j * ch;
        const lerp = (v1: number, v2: number) => (c - v1) / (v2 - v1);
        const top = [x0 + lerp(a, b) * cw, y0];
        const right = [x0 + cw, y0 + lerp(b, cc) * ch];
        const bottom = [x0 + lerp(dd, cc) * cw, y0 + ch];
        const left = [x0, y0 + lerp(a, dd) * ch];
        const seg = (p: number[], q: number[]) => { d += `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 10: seg(left, bottom); seg(top, right); break;
        }
      }
    }
    out.push({ level, d });
  }
  return out;
}

const LEVELS = Array.from({ length: 16 }, (_, k) => 1000 + k * 20);

export function CrossSection({ start = "conical" }: { start?: string }) {
  const [mode, setMode] = useState<"draw" | "identify">("draw");
  const [lf, setLf] = useState(start);
  const [ly, setLy] = useState(0.5);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const quizId = useMemo(() => shuffle(LANDFORMS.map((l) => l.id), `cs-${round}`)[0], [round]);
  const active = LANDFORMS.find((l) => l.id === (mode === "identify" ? quizId : lf))!;
  const lines = useMemo(() => contours(active.h, LEVELS), [active]);
  const options = useMemo(() => shuffle([quizId, ...shuffle(LANDFORMS.map((l) => l.id).filter((x) => x !== quizId), `o-${round}`).slice(0, 3)], `p-${round}`), [quizId, round]);

  // profile along A–B
  const N = 120;
  const xa = 0.05, xb = 0.95;
  const prof = Array.from({ length: N + 1 }, (_, k) => { const x = xa + ((xb - xa) * k) / N; return active.h(x, ly); });
  const minH = 980, maxH = 1320;
  const PX = (k: number) => 30 + (k / N) * 360;
  const PY = (hh: number) => 150 - ((hh - minH) / (maxH - minH)) * 130;
  const ha = prof[0] + 2, hb = prof[N] + 2;
  const blocked = prof.some((hh, k) => k > 0 && k < N && hh > ha + ((hb - ha) * k) / N);
  const peak = Math.max(...prof);

  return (
    <WidgetFrame title="Contours → cross-section" instruction="Pick a landform, move the line A–B and watch the cross-section draw itself. Check intervisibility between A and B." colour="var(--t-mapwork)">
      <Segmented options={[{ id: "draw", label: "Draw cross-sections" }, { id: "identify", label: "Identify the landform (quiz)" }]} value={mode} onChange={(m) => { setMode(m); setPicked(null); }} colour="var(--t-mapwork)" />
      {mode === "draw" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LANDFORMS.map((l) => <button key={l.id} onClick={() => setLf(l.id)} aria-pressed={lf === l.id} className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold", lf === l.id ? "border-mapwork bg-mapwork text-white" : "border-line text-muted hover:text-fg")}>{l.name}</button>)}
        </div>
      )}
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="diagram rounded-xl border border-line" role="img" aria-label={mode === "identify" ? "Contour map of a mystery landform" : `Contour map of a ${active.name}`}>
            <rect width={W} height={H} fill="#fdfbf3" />
            {lines.map((c) => <path key={c.level} d={c.d} fill="none" stroke="#a0522d" strokeWidth={c.level % 100 === 0 ? 1.8 : 0.9} />)}
            {active.river && <path d={`M${W / 2},0 L${W / 2},${H}`} stroke="#2563eb" strokeWidth="2" strokeDasharray="0" />}
            {mode === "draw" && (
              <g>
                <line x1={xa * W} y1={ly * H} x2={xb * W} y2={ly * H} stroke="#dc2626" strokeWidth="2" />
                <circle cx={xa * W} cy={ly * H} r="4" fill="#dc2626" /><text x={xa * W - 2} y={ly * H - 7} fontSize="12" fontWeight="800" style={{ fill: "#dc2626" }}>A</text>
                <circle cx={xb * W} cy={ly * H} r="4" fill="#dc2626" /><text x={xb * W - 6} y={ly * H - 7} fontSize="12" fontWeight="800" style={{ fill: "#dc2626" }}>B</text>
              </g>
            )}
            <text x={W - 6} y={H - 6} fontSize="9" textAnchor="end" style={{ fill: "#6b4423" }}>CI = 20 m · index contours every 100 m · lowest 1 000 m</text>
          </svg>
          {mode === "draw" && (
            <label className="mt-2 block text-sm">Move line A–B
              <input type="range" min={0.08} max={0.92} step={0.01} value={ly} onChange={(e) => setLy(Number(e.target.value))} className="w-full accent-[var(--t-mapwork)]" aria-label="Line position" />
            </label>
          )}
        </div>
        {mode === "draw" ? (
          <div>
            <svg viewBox="0 0 400 180" className="diagram rounded-xl border border-line" role="img" aria-label="Cross-section from A to B">
              <rect width="400" height="180" fill="var(--surface)" />
              {[1000, 1100, 1200, 1300].map((v) => <g key={v}><line x1="30" x2="390" y1={PY(v)} y2={PY(v)} stroke="var(--border)" /><text x="26" y={PY(v) + 3} fontSize="8" textAnchor="end" className="muted">{v}</text></g>)}
              <path d={`${prof.map((hh, k) => `${k ? "L" : "M"}${PX(k)},${PY(hh)}`).join(" ")} L${PX(N)},150 L${PX(0)},150 Z`} fill="#a16207" fillOpacity="0.3" stroke="#a16207" strokeWidth="2" />
              <line x1={PX(0)} y1={PY(ha)} x2={PX(N)} y2={PY(hb)} stroke={blocked ? "var(--danger)" : "var(--success)"} strokeWidth="1.5" strokeDasharray="5 4" />
              <text x={PX(0)} y="166" fontSize="11" fontWeight="800">A</text>
              <text x={PX(N) - 8} y="166" fontSize="11" fontWeight="800">B</text>
              <text x="210" y="176" fontSize="8" textAnchor="middle" className="muted">metres above sea level · vertical scale exaggerated</text>
            </svg>
            <div className={cn("mt-2 rounded-xl p-3 text-sm", blocked ? "bg-danger/10" : "bg-success/10")} role="status">
              <strong>{blocked ? "A and B are NOT intervisible" : "A and B ARE intervisible"}</strong> – {blocked ? "higher ground between them blocks the line of sight." : "nothing between them rises above the line of sight."} Highest point on the section: {Math.round(peak)} m.
            </div>
            <div className="mt-2 rounded-xl bg-surface-2 p-3 text-sm"><Md text={active.text} /></div>
          </div>
        ) : (
          <div>
            <p className="font-semibold">Which landform do these contours show?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {options.map((o) => {
                const lfm = LANDFORMS.find((l) => l.id === o)!;
                return (
                  <button key={o} disabled={picked !== null} onClick={() => { setPicked(o); if (o === quizId) bumpStat("toolsUsed"); }}
                    className={cn("rounded-xl border-2 px-3 py-2 text-sm font-semibold", picked && o === quizId ? "border-success bg-success/10" : picked === o ? "border-danger bg-danger/10" : "border-line hover:border-mapwork")}>{lfm.name}</button>
                );
              })}
            </div>
            <Feedback ok={picked ? picked === quizId : null}><Md text={active.text} /></Feedback>
            <button disabled={!picked} onClick={() => { setRound((x) => x + 1); setPicked(null); }} className="mt-3 rounded-xl bg-mapwork px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Next landform</button>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}
