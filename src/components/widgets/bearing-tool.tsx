"use client";
import { useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { bearingBetween, compassPoint } from "@/lib/mapcalc";
import { bumpStat } from "@/lib/progress";
import { seededRandom } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Feedback, Segmented, WidgetFrame } from "./widget-frame";

const W = 360;
const H = 260;

/** Drag A and B to measure true bearings; practise estimating them. */
export function BearingTool() {
  const [a, setA] = useState<[number, number]>([120, 160]);
  const [b, setB] = useState<[number, number]>([270, 70]);
  const [drag, setDrag] = useState<"a" | "b" | null>(null);
  const [mode, setMode] = useState<"measure" | "practice">("measure");
  const [guess, setGuess] = useState("");
  const [res, setRes] = useState<boolean | null>(null);
  const [seed, setSeed] = useState(1);
  const svg = useRef<SVGSVGElement>(null);
  const tb = bearingBetween(a[0], a[1], b[0], b[1]);
  const back = (tb + 180) % 360;

  const move = (e: React.PointerEvent) => {
    if (!drag || !svg.current || mode === "practice") return;
    const rect = svg.current.getBoundingClientRect();
    const x = Math.max(10, Math.min(W - 10, ((e.clientX - rect.left) / rect.width) * W));
    const y = Math.max(10, Math.min(H - 10, ((e.clientY - rect.top) / rect.height) * H));
    if (drag === "a") setA([x, y]); else setB([x, y]);
  };
  const newProblem = () => {
    const r = seededRandom(`bearing-${seed + 1}`);
    setSeed((s) => s + 1);
    setA([60 + r() * 240, 40 + r() * 180]);
    setB([60 + r() * 240, 40 + r() * 180]);
    setGuess("");
    setRes(null);
  };
  const arc = (deg: number, rad: number) => {
    const t = (deg * Math.PI) / 180;
    return `M${a[0]},${a[1] - rad} A${rad},${rad} 0 ${deg > 180 ? 1 : 0} 1 ${a[0] + rad * Math.sin(t)},${a[1] - rad * Math.cos(t)}`;
  };

  return (
    <WidgetFrame title="True bearing protractor" instruction="Drag A and B. A true bearing is measured clockwise from TRUE NORTH, from the first point to the second." colour="var(--t-mapwork)">
      <Segmented options={[{ id: "measure", label: "Measure" }, { id: "practice", label: "Estimate (practice)" }]} value={mode} onChange={(m) => { setMode(m); setRes(null); setGuess(""); }} colour="var(--t-mapwork)" />
      <div className="mt-3 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="diagram touch-none rounded-xl border border-line" role="img" aria-label={`Point A and point B; bearing from A to B ${mode === "measure" ? Math.round(tb) + " degrees" : "hidden"}`}
          onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
          <rect width={W} height={H} fill="#fdfbf3" />
          {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2={H} stroke="#bfdbfe" strokeOpacity="0.6" />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} y1={i * 52} x1="0" y2={i * 52} x2={W} stroke="#bfdbfe" strokeOpacity="0.6" />)}
          <line x1={a[0]} y1={a[1]} x2={a[0]} y2={Math.max(4, a[1] - 90)} stroke="var(--map-ink)" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x={a[0] + 4} y={Math.max(14, a[1] - 80)} fontSize="9" fontWeight="700">TN</text>
          {mode === "measure" && <path d={arc(tb, 36)} fill="none" stroke="var(--t-mapwork)" strokeWidth="2.5" />}
          <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#dc2626" strokeWidth="2" />
          {(["a", "b"] as const).map((k) => {
            const p = k === "a" ? a : b;
            return (
              <g key={k} onPointerDown={(e) => { if (mode === "practice") return; (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(k); }} style={{ cursor: mode === "measure" ? "grab" : "default" }}>
                <circle cx={p[0]} cy={p[1]} r="14" fill="transparent" />
                <circle cx={p[0]} cy={p[1]} r="6" fill={k === "a" ? "#dc2626" : "#2563eb"} stroke="white" strokeWidth="2" />
                <text x={p[0] + 9} y={p[1] - 8} fontSize="13" fontWeight="800">{k.toUpperCase()}</text>
              </g>
            );
          })}
          <g transform={`translate(${W - 20},24)`}><path d="M0,-14 L5,4 L0,0 L-5,4 Z" fill="var(--map-ink)" /><text y="14" fontSize="9" textAnchor="middle" fontWeight="700">N</text></g>
        </svg>
        <div className="text-sm">
          {mode === "measure" ? (
            <div className="space-y-2">
              <div className="rounded-xl bg-mapwork/10 p-3"><div className="text-xs text-muted">True bearing of B from A</div><div className="font-display text-3xl font-bold text-mapwork">{Math.round(tb)}°</div><div className="text-muted">Direction: {compassPoint(tb)}</div></div>
              <div className="rounded-xl bg-surface-2 p-3"><div className="text-xs text-muted">Back bearing (A from B)</div><div className="font-display text-xl font-bold">{Math.round(back)}°</div><div className="text-xs text-muted">= true bearing ± 180°</div></div>
              <ol className="list-decimal space-y-1 pl-5 text-muted">
                <li>Join the two points with a straight line.</li>
                <li>Draw a true north line through the <strong className="text-fg">first</strong> point.</li>
                <li>Measure the angle <strong className="text-fg">clockwise</strong> from north to the line.</li>
              </ol>
            </div>
          ) : (
            <div>
              <p>Estimate the true bearing of <strong>B from A</strong> (within 5°).</p>
              <div className="mt-2 flex gap-2">
                <input value={guess} onChange={(e) => { setGuess(e.target.value); setRes(null); }} inputMode="numeric" placeholder="e.g. 135" aria-label="Your bearing" className="w-28 rounded-lg border border-line bg-bg px-3 py-2" />
                <Button size="sm" disabled={!guess} onClick={() => { const g = Number(guess); const diff = Math.abs(((g - tb + 540) % 360) - 180); const ok = diff <= 5; setRes(ok); if (ok) bumpStat("calculations"); }}>Check</Button>
                <Button size="sm" variant="secondary" onClick={newProblem}><RefreshCw className="h-4 w-4" /> New</Button>
              </div>
              <Feedback ok={res}>The true bearing is <strong>{Math.round(tb)}°</strong> ({compassPoint(tb)}). {res ? "Great estimate!" : "Remember: N = 0°, E = 90°, S = 180°, W = 270°."}</Feedback>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}
