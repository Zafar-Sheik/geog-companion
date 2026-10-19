"use client";
import { useState } from "react";
import { Check, Eye, RotateCcw } from "lucide-react";
import { solvePuzzle } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Feedback, WidgetFrame } from "./widget-frame";

type P = [number, number];
const N: Record<string, P> = {
  S1: [50, 30], S2: [128, 22], S3: [178, 64], S4: [246, 20], S5: [330, 34], S6: [360, 112], S7: [80, 196],
  J2: [116, 104], J4: [162, 150], J3: [290, 96], J5: [292, 160], J1: [212, 206], J6: [200, 246], M: [200, 296],
};
/** [from, to, Strahler order] */
const SEGS: [string, string, number][] = [
  ["S1", "J2", 1], ["S2", "J2", 1], ["S3", "J4", 1], ["J2", "J4", 2], ["S4", "J3", 1], ["S5", "J3", 1], ["S6", "J5", 1],
  ["J3", "J5", 2], ["J4", "J1", 2], ["J5", "J1", 2], ["S7", "J6", 1], ["J1", "J6", 3], ["J6", "M", 3],
];
const COLOURS = ["var(--surface-2)", "#60a5fa", "#2563eb", "#1e3a8a"];

function curve(a: P, b: P, k: number) {
  const mx = (a[0] + b[0]) / 2 + (k % 2 ? 10 : -10);
  const my = (a[1] + b[1]) / 2;
  return `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`;
}

/** Strahler stream ordering: tap each stream segment to set its order, then check. */
export function StreamOrder() {
  const [orders, setOrders] = useState<number[]>(SEGS.map(() => 0));
  const [checked, setChecked] = useState(false);
  const [labels, setLabels] = useState(false);
  const right = SEGS.filter((s, i) => orders[i] === s[2]).length;

  const cycle = (i: number) => {
    if (checked) return;
    setOrders((o) => o.map((v, k) => (k === i ? (v % 3) + 1 : v)));
  };

  return (
    <WidgetFrame title="Stream ordering (Strahler method)" instruction="Tap a stream segment to cycle its order 1 → 2 → 3. Order every segment, then check." colour="var(--t-geomorph)">
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <svg viewBox="0 0 400 310" className="diagram rounded-xl border border-line" role="img" aria-label="River network for stream ordering">
          <rect width="400" height="310" fill="var(--land)" />
          <path d="M30,60 Q20,10 120,8 Q250,0 360,14 Q400,60 380,140 Q360,220 250,250 Q215,262 200,300 Q185,262 150,250 Q50,230 30,160 Q22,110 30,60 Z" fill="none" stroke="var(--t-geomorph)" strokeWidth="1.5" strokeDasharray="6 4" />
          {labels && <text x="300" y="250" fontSize="10" fontWeight="700" style={{ fill: "var(--t-geomorph)" }}>watershed (drainage divide)</text>}
          {SEGS.map(([a, b], i) => {
            const o = orders[i];
            const wrong = checked && o !== SEGS[i][2];
            return (
              <g key={i} onClick={() => cycle(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && cycle(i)} tabIndex={0} role="button" aria-label={`Stream segment ${i + 1}, order ${o || "not set"}`} style={{ cursor: checked ? "default" : "pointer" }}>
                <path d={curve(N[a], N[b], i)} fill="none" stroke="transparent" strokeWidth="16" />
                <path d={curve(N[a], N[b], i)} fill="none" stroke={wrong ? "var(--danger)" : o ? COLOURS[o] : "#93c5fd"} strokeWidth={2 + (o || 1) * 1.6} strokeLinecap="round" strokeDasharray={o ? undefined : "4 4"} />
                {o > 0 && (() => { const mx = (N[a][0] + N[b][0]) / 2 + (i % 2 ? 10 : -10) / 2; const my = (N[a][1] + N[b][1]) / 2; return <g><circle cx={mx} cy={my} r="8" fill="var(--surface)" stroke={wrong ? "var(--danger)" : COLOURS[o]} strokeWidth="2" /><text x={mx} y={my + 3.5} fontSize="10" textAnchor="middle" fontWeight="800">{o}</text></g>; })()}
              </g>
            );
          })}
          {labels && (
            <g fontSize="9" fontWeight="700">
              <text x={N.S1[0] - 4} y={N.S1[1] - 6} textAnchor="middle">source</text>
              <text x={N.J1[0] + 10} y={N.J1[1]}>confluence</text>
              <text x={N.M[0] + 8} y={N.M[1] - 2}>mouth</text>
              <text x="40" y="250">tributary →</text>
            </g>
          )}
          <circle cx={N.M[0]} cy={N.M[1]} r="4" fill="var(--water)" />
        </svg>
        <div className="text-sm">
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="mb-1 font-bold">The rules</div>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Streams with <strong>no tributaries</strong> (starting at a source) are <strong>1st order</strong>.</li>
              <li>Where <strong>two streams of the same order</strong> meet, the stream below is <strong>one order higher</strong> (1 + 1 → 2; 2 + 2 → 3).</li>
              <li>Where <strong>streams of different orders</strong> meet, the stream below keeps the <strong>higher</strong> order (2 + 1 → 2).</li>
            </ol>
          </div>
          <p className="mt-3 text-muted">The <strong>highest order</strong> tells you the order of the whole drainage basin. Higher order = bigger basin, more tributaries, more water.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!checked ? <Button size="sm" onClick={() => { setChecked(true); if (right === SEGS.length) solvePuzzle("stream-order", 20); }} disabled={orders.some((o) => !o)}><Check className="h-4 w-4" /> Check</Button>
              : <Button size="sm" variant="secondary" onClick={() => { setChecked(false); setOrders(SEGS.map(() => 0)); }}><RotateCcw className="h-4 w-4" /> Reset</Button>}
            <Button size="sm" variant="ghost" onClick={() => setLabels((l) => !l)}><Eye className="h-4 w-4" /> {labels ? "Hide" : "Show"} labels</Button>
          </div>
          <Feedback ok={checked ? right === SEGS.length : null}>{right}/{SEGS.length} segments correct. {right === SEGS.length ? "This is a 3rd-order drainage basin." : "Red segments are wrong – check the rules (2 + 1 stays 2!)."}</Feedback>
        </div>
      </div>
    </WidgetFrame>
  );
}
