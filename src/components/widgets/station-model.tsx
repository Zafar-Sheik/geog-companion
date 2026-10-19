"use client";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { bumpStat } from "@/lib/progress";
import { cn, shuffle } from "@/lib/utils";
import { Feedback, Segmented, WidgetFrame } from "./widget-frame";

const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const WX = { none: { sym: "", label: "No significant weather" }, rain: { sym: "••", label: "Rain" }, drizzle: { sym: ",,", label: "Drizzle" }, fog: { sym: "≡", label: "Fog" }, storm: { sym: "⚡", label: "Thunderstorm" }, snow: { sym: "✱✱", label: "Snow" } } as const;
type Wx = keyof typeof WX;

interface Obs { temp: number; dew: number; dir: number; speed: number; oktas: number; wx: Wx }

function Model({ o }: { o: Obs }) {
  const c = 100;
  const r = 12;
  const b = (o.dir * 45 * Math.PI) / 180;
  const ux = Math.sin(b);
  const uy = -Math.cos(b);
  const sx = c + ux * r;
  const sy = c + uy * r;
  const ex = c + ux * 64;
  const ey = c + uy * 64;
  // barbs: pennant = 50 kt, full = 10 kt, half = 5 kt, drawn from the outer end inwards
  let left = Math.round(o.speed / 5) * 5;
  const barbs: { kind: "pennant" | "full" | "half"; pos: number }[] = [];
  let pos = 0;
  while (left >= 50) { barbs.push({ kind: "pennant", pos }); pos += 10; left -= 50; }
  while (left >= 10) { barbs.push({ kind: "full", pos }); pos += 7; left -= 10; }
  if (left >= 5) barbs.push({ kind: "half", pos: pos + (pos === 0 ? 7 : 0) });
  // feathers lean back at 60° from the shaft, on one side
  const px = -uy;
  const py = ux;
  const barbEnd = (p: number, len: number) => {
    const bx = ex - ux * p;
    const by = ey - uy * p;
    return { bx, by, tx: bx + px * len + ux * len * 0.5, ty: by + py * len + uy * len * 0.5 };
  };
  const quarter = (n: number) => {
    // pie fill from north, clockwise
    if (n <= 0) return null;
    if (n >= 4) return <circle cx={c} cy={c} r={r} fill="var(--map-ink)" />;
    const a = (n / 4) * Math.PI * 2;
    const x = c + Math.sin(a) * r;
    const y = c - Math.cos(a) * r;
    return <path d={`M${c},${c} L${c},${c - r} A${r},${r} 0 ${n > 2 ? 1 : 0} 1 ${x},${y} Z`} fill="var(--map-ink)" />;
  };
  const q = Math.floor(o.oktas / 2);
  const odd = o.oktas % 2 === 1;
  return (
    <svg viewBox="0 0 200 200" className="diagram mx-auto max-w-[280px]" role="img" aria-label="Station model">
      <rect width="200" height="200" rx="12" fill="var(--surface-2)" />
      {o.speed > 0 && <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="var(--map-ink)" strokeWidth="2" />}
      {o.speed > 0 && barbs.map((bb, i) => {
        if (bb.kind === "pennant") {
          const a = barbEnd(bb.pos, 16);
          const b2 = barbEnd(bb.pos + 8, 0);
          return <path key={i} d={`M${a.bx},${a.by} L${a.tx},${a.ty} L${b2.bx},${b2.by} Z`} fill="var(--map-ink)" />;
        }
        const e = barbEnd(bb.pos, bb.kind === "full" ? 16 : 8);
        return <line key={i} x1={e.bx} y1={e.by} x2={e.tx} y2={e.ty} stroke="var(--map-ink)" strokeWidth="2" />;
      })}
      <circle cx={c} cy={c} r={r} fill="var(--surface)" stroke="var(--map-ink)" strokeWidth="2" />
      {o.oktas === 8 ? <circle cx={c} cy={c} r={r} fill="var(--map-ink)" /> : (
        <>
          {quarter(q)}
          {odd && o.oktas !== 7 && <line x1={c} y1={c - r} x2={c} y2={c + r} stroke="var(--map-ink)" strokeWidth="2.5" />}
          {o.oktas === 7 && <><circle cx={c} cy={c} r={r} fill="var(--map-ink)" /><line x1={c} y1={c - r + 1} x2={c} y2={c + r - 1} stroke="var(--surface)" strokeWidth="3" /></>}
        </>
      )}
      {o.speed === 0 && <circle cx={c} cy={c} r={r + 5} fill="none" stroke="var(--map-ink)" strokeWidth="1.5" />}
      <text x={c - 22} y={c - 16} fontSize="16" fontWeight="700" textAnchor="end" style={{ fill: "var(--danger)" }}>{o.temp}</text>
      <text x={c - 22} y={c + 30} fontSize="16" fontWeight="700" textAnchor="end" style={{ fill: "#16a34a" }}>{o.dew}</text>
      <text x={c - 24} y={c + 6} fontSize="15" textAnchor="end" style={{ fill: "var(--t-climate)" }}>{WX[o.wx].sym}</text>
    </svg>
  );
}

function describeCloud(n: number) {
  return n === 0 ? "clear sky (0 oktas)" : n === 8 ? "overcast (8 oktas)" : `${n}/8 of the sky covered (${n} oktas)`;
}

const randomObs = (seed: number): Obs => {
  const r = (n: number) => Math.floor(((Math.sin(seed * 9301 + n * 49297) + 1) / 2) * 1000);
  const temp = 4 + (r(1) % 28);
  return { temp, dew: temp - (r(2) % 14), dir: r(3) % 8, speed: [0, 5, 10, 15, 20, 25, 30, 50][r(4) % 8], oktas: r(5) % 9, wx: (Object.keys(WX) as Wx[])[r(6) % 6] };
};

export function StationModel() {
  const [mode, setMode] = useState<"build" | "read">("build");
  const [o, setO] = useState<Obs>({ temp: 24, dew: 13, dir: 7, speed: 15, oktas: 2, wx: "none" });
  const [seed, setSeed] = useState(1);
  const quiz = useMemo(() => randomObs(seed), [seed]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = useMemo(() => [
    { k: "temp", q: "Air temperature?", a: `${quiz.temp} °C`, opts: shuffle([`${quiz.temp} °C`, `${quiz.dew} °C`, `${quiz.temp + 3} °C`, `${quiz.temp - 2} °C`].filter((v, i, arr) => arr.indexOf(v) === i), seed) },
    { k: "dew", q: "Dew point temperature?", a: `${quiz.dew} °C`, opts: shuffle([`${quiz.dew} °C`, `${quiz.temp} °C`, `${quiz.dew + 4} °C`, `${quiz.dew - 3} °C`].filter((v, i, arr) => arr.indexOf(v) === i), seed + 1) },
    { k: "dir", q: "Wind direction (where it blows FROM)?", a: quiz.speed === 0 ? "Calm" : DIRS[quiz.dir], opts: quiz.speed === 0 ? ["Calm", "N", "S", "E"] : shuffle([DIRS[quiz.dir], DIRS[(quiz.dir + 4) % 8], DIRS[(quiz.dir + 2) % 8], DIRS[(quiz.dir + 6) % 8]], seed + 2) },
    { k: "speed", q: "Wind speed?", a: `${quiz.speed} knots`, opts: shuffle([...new Set([`${quiz.speed} knots`, "5 knots", "15 knots", "25 knots", "50 knots"])].slice(0, 4), seed + 3) },
    { k: "cloud", q: "Cloud cover?", a: `${quiz.oktas} oktas`, opts: shuffle([...new Set([`${quiz.oktas} oktas`, `${(quiz.oktas + 4) % 9} oktas`, `${(quiz.oktas + 2) % 9} oktas`, `${(quiz.oktas + 6) % 9} oktas`])], seed + 4) },
  ].map((qq) => (qq.opts.includes(qq.a) ? qq : { ...qq, opts: [qq.a, ...qq.opts.slice(0, 3)] })), [quiz, seed]);
  const done = questions.every((qq) => answers[qq.k]);
  const score = questions.filter((qq) => answers[qq.k] === qq.a).length;
  const depression = o.temp - o.dew;

  return (
    <WidgetFrame title="Synoptic station model" instruction="Build a station model from observations – or test yourself by reading one." colour="var(--t-climate)">
      <Segmented options={[{ id: "build", label: "Build one" }, { id: "read", label: "Read one (quiz)" }]} value={mode} onChange={(m) => { setMode(m); setAnswers({}); }} colour="var(--t-climate)" />
      {mode === "build" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <div>
            <Model o={o} />
            <ul className="mt-2 space-y-0.5 text-xs text-muted">
              <li><span className="font-bold text-danger">Top left</span>: air temperature (°C)</li>
              <li><span className="font-bold text-success">Bottom left</span>: dew point temperature (°C)</li>
              <li><strong>Shaft</strong> points to where the wind blows <strong>from</strong>; feathers show speed: half = 5 kt, full = 10 kt, pennant = 50 kt</li>
              <li><strong>Circle shading</strong>: cloud cover in oktas (eighths)</li>
            </ul>
          </div>
          <div className="grid gap-3 text-sm">
            <label>Temperature: <strong>{o.temp} °C</strong><input type="range" min={-5} max={40} value={o.temp} onChange={(e) => setO({ ...o, temp: Number(e.target.value), dew: Math.min(o.dew, Number(e.target.value)) })} className="w-full accent-[var(--danger)]" /></label>
            <label>Dew point: <strong>{o.dew} °C</strong><input type="range" min={-10} max={o.temp} value={o.dew} onChange={(e) => setO({ ...o, dew: Number(e.target.value) })} className="w-full accent-[var(--success)]" /></label>
            <div>Wind from:
              <div className="mt-1 flex flex-wrap gap-1">{DIRS.map((d, i) => <button key={d} onClick={() => setO({ ...o, dir: i })} aria-pressed={o.dir === i} className={cn("w-10 rounded-lg border py-1 text-xs font-bold", o.dir === i ? "border-climate bg-climate text-white" : "border-line")}>{d}</button>)}</div>
            </div>
            <label>Wind speed: <strong>{o.speed} knots</strong> ({Math.round(o.speed * 1.852)} km/h)<input type="range" min={0} max={65} step={5} value={o.speed} onChange={(e) => setO({ ...o, speed: Number(e.target.value) })} className="w-full accent-[var(--t-climate)]" /></label>
            <label>Cloud cover: <strong>{describeCloud(o.oktas)}</strong><input type="range" min={0} max={8} value={o.oktas} onChange={(e) => setO({ ...o, oktas: Number(e.target.value) })} className="w-full accent-[var(--t-climate)]" /></label>
            <div>Present weather:
              <div className="mt-1 flex flex-wrap gap-1">{(Object.keys(WX) as Wx[]).map((k) => <button key={k} onClick={() => setO({ ...o, wx: k })} aria-pressed={o.wx === k} className={cn("rounded-lg border px-2 py-1 text-xs", o.wx === k ? "border-climate bg-climate text-white" : "border-line")}>{WX[k].label}</button>)}</div>
            </div>
            <div className={cn("rounded-xl p-3", depression <= 2 ? "bg-climate/10" : "bg-surface-2")}>
              <strong>Dew point depression: {depression} °C.</strong>{" "}
              {depression <= 2 ? "The air is almost saturated – high relative humidity, so expect cloud, fog, drizzle or rain." : depression >= 15 ? "Big gap – the air is very dry (low relative humidity). Typical of berg winds or the winter interior." : "Moderate humidity."}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <div>
            <Model o={quiz} />
            <button onClick={() => { setSeed((s) => s + 1); setAnswers({}); }} className="mx-auto mt-2 flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm"><RefreshCw className="h-4 w-4" /> New station</button>
          </div>
          <div className="space-y-3">
            {questions.map((qq) => (
              <div key={qq.k}>
                <div className="text-sm font-semibold">{qq.q}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {qq.opts.map((op) => {
                    const picked = answers[qq.k] === op;
                    const show = Boolean(answers[qq.k]);
                    return (
                      <button key={op} disabled={show} onClick={() => { setAnswers((a) => ({ ...a, [qq.k]: op })); if (op === qq.a) bumpStat("toolsUsed"); }}
                        className={cn("rounded-lg border px-3 py-1 text-sm", show && op === qq.a ? "border-success bg-success/15" : picked ? "border-danger bg-danger/15" : "border-line hover:border-climate")}>{op}</button>
                    );
                  })}
                </div>
              </div>
            ))}
            <Feedback ok={done ? score === questions.length : null}>{score}/{questions.length} correct. {score === questions.length ? "You can read a weather map like a forecaster!" : "Check the key in Build mode and try another station."}</Feedback>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
