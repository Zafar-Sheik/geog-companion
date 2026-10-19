"use client";
import { useMemo, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { area, distance, gradient, magneticBearing, magneticDeclination, speedTime, verticalExaggeration, withinTolerance, type Worked } from "@/lib/mapcalc";
import { bumpStat } from "@/lib/progress";
import { seededRandom } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Feedback, Md, Segmented, WidgetFrame } from "./widget-frame";

type Calc = "distance" | "area" | "gradient" | "declination" | "ve" | "time";

const TABS: { id: Calc; label: string }[] = [
  { id: "distance", label: "Distance" },
  { id: "area", label: "Area" },
  { id: "gradient", label: "Gradient" },
  { id: "declination", label: "Magnetic declination" },
  { id: "ve", label: "Vertical exaggeration" },
  { id: "time", label: "Speed & time" },
];

const TIPS: Record<Calc, string> = {
  distance: "Topographic map 1:50 000 → 1 cm = 0.5 km (500 m). Orthophoto map 1:10 000 → 1 cm = 0.1 km (100 m). Always measure from the **centre** of a symbol and give **units**.",
  area: "Measure the length and breadth on the map in cm, convert each to km **first**, then multiply. Answer in km².",
  gradient: "Find the two heights (spot heights, trig stations or contours), work out VI in metres and HE in metres (same units!), then divide so the answer is **1 : x**. A small x means steep.",
  declination: "Read the base year, base declination and mean annual change from the map's margin. If the change is **westwards** you **add**; **eastwards** you **subtract**. Then magnetic bearing = true bearing + magnetic declination.",
  ve: "VE tells you how many times the vertical scale has been stretched on a cross-section. Write both scales as ratios (1 cm = 20 m → 1 : 2 000) and divide horizontal by vertical.",
  time: "Distance from the map (in km) ÷ speed (km/h) = time in hours. Multiply by 60 for minutes.",
};

function Working({ w }: { w: Worked }) {
  return (
    <ol className="mt-3 space-y-1 rounded-xl border border-mapwork/40 bg-mapwork/5 p-3 font-mono text-[13px]">
      {w.steps.map((s, i) => <li key={i} className={i === w.steps.length - 1 ? "font-bold text-mapwork" : undefined}>{s}</li>)}
    </ol>
  );
}

function Num({ label, value, onChange, step = 0.1, suffix }: { label: string; value: number; onChange: (v: number) => void; step?: number; suffix?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <span className="mt-0.5 flex items-center gap-1">
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-lg border border-line bg-bg px-2 py-1.5 outline-none focus:border-mapwork" />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function practiceProblem(calc: Calc, seed: number): { q: string; w: Worked; unit: string; tol: number } {
  const r = seededRandom(`${calc}-${seed}`);
  const pick = (a: number, b: number, dp = 1) => Number((a + r() * (b - a)).toFixed(dp));
  switch (calc) {
    case "distance": {
      const scale = r() < 0.7 ? 50000 : 10000;
      const cm = pick(1.5, 9);
      return { q: `On a 1:${scale.toLocaleString("en-ZA")} map the distance between two points is ${cm} cm. Calculate the actual distance in km.`, w: distance(cm, scale), unit: "km", tol: 0.02 };
    }
    case "area": {
      const l = pick(2, 6);
      const b = pick(1.5, 5);
      return { q: `A farm on the 1:50 000 map measures ${l} cm by ${b} cm. Calculate its area in km².`, w: area(l, b, 50000), unit: "km²", tol: 0.02 };
    }
    case "gradient": {
      const low = Math.round(pick(900, 1300, 0) / 20) * 20;
      const high = low + Math.round(pick(60, 300, 0) / 20) * 20;
      const cm = pick(1.2, 6);
      return { q: `Spot height A is ${high} m and trigonometrical station B is ${low} m. They are ${cm} cm apart on a 1:50 000 map. Calculate the average gradient. Give x in 1 : x.`, w: gradient(high, low, cm, 50000), unit: "(x)", tol: 0.04 };
    }
    case "declination": {
      const baseYear = [2006, 2010, 2012, 2015][Math.floor(r() * 4)];
      const baseDeg = 22 + Math.floor(r() * 4);
      const baseMin = [0, 10, 20, 30, 40, 50][Math.floor(r() * 6)];
      const ann = [2, 3, 4, 5, 6, 8, 9][Math.floor(r() * 7)];
      const dir = r() < 0.75 ? "W" : "E";
      const w = magneticDeclination(baseDeg, baseMin, baseYear, ann, dir, 2026);
      return { q: `Mean magnetic declination ${baseDeg}°${String(baseMin).padStart(2, "0")}' west of true north (${baseYear}). Mean annual change ${ann}' ${dir === "W" ? "westwards" : "eastwards"}. Calculate the magnetic declination for 2026, in degrees as a decimal (e.g. 25.5).`, w, unit: "°", tol: 0.004 };
    }
    case "ve": {
      const vs = [1000, 2000, 2500, 4000, 5000][Math.floor(r() * 5)];
      return { q: `A cross-section has a vertical scale of 1 cm represents ${vs / 100} m (1:${vs}) and a horizontal scale of 1:50 000. Calculate the vertical exaggeration.`, w: verticalExaggeration(vs, 50000), unit: "times", tol: 0.01 };
    }
    case "time": {
      const km = pick(3, 15);
      const sp = [40, 60, 80, 100, 120][Math.floor(r() * 5)];
      return { q: `A truck travels ${km} km along the main road at an average speed of ${sp} km/h. How many minutes will the trip take?`, w: speedTime(km, sp), unit: "minutes", tol: 0.02 };
    }
  }
}

export function MapCalculator({ start = "distance" }: { start?: Calc }) {
  const [calc, setCalc] = useState<Calc>(start);
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  // learn inputs
  const [cm, setCm] = useState(4.2);
  const [scale, setScale] = useState(50000);
  const [l, setL] = useState(3.5);
  const [b, setB] = useState(2.4);
  const [hi, setHi] = useState(1480);
  const [lo, setLo] = useState(1220);
  const [dec, setDec] = useState({ deg: 24, min: 30, year: 2010, ann: 5, dir: "W" as "W" | "E", now: 2026, tb: 120 });
  const [vs, setVs] = useState(2000);
  const [km, setKm] = useState(6.5);
  const [sp, setSp] = useState(60);
  // practice
  const [seed, setSeed] = useState(1);
  const [ans, setAns] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const prob = useMemo(() => practiceProblem(calc, seed), [calc, seed]);

  const worked: Worked = (() => {
    switch (calc) {
      case "distance": return distance(cm, scale);
      case "area": return area(l, b, scale);
      case "gradient": return gradient(hi, lo, cm, scale);
      case "declination": return magneticDeclination(dec.deg, dec.min, dec.year, dec.ann, dec.dir, dec.now);
      case "ve": return verticalExaggeration(vs, scale);
      case "time": return speedTime(km, sp);
    }
  })();

  const check = () => {
    const ok = withinTolerance(Number(ans.replace(",", ".")), prob.w.answer, prob.tol);
    setResult(ok);
    if (ok) bumpStat("calculations");
  };

  return (
    <WidgetFrame title="Map calculations" instruction="Learn mode shows the full memo-style working. Practice mode gives you a new question every time." colour="var(--t-mapwork)">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented options={TABS} value={calc} onChange={(c) => { setCalc(c); setResult(null); setAns(""); }} colour="var(--t-mapwork)" />
        <Segmented options={[{ id: "learn", label: "Learn" }, { id: "practice", label: "Practice" }]} value={mode} onChange={(m) => { setMode(m); setResult(null); setAns(""); }} colour="var(--brand)" />
      </div>
      <Md text={TIPS[calc]} className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" />
      {mode === "learn" ? (
        <div className="mt-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {calc !== "declination" && calc !== "time" && (
              <label className="block text-sm"><span className="text-muted">Map scale</span>
                <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="mt-0.5 w-full rounded-lg border border-line bg-bg px-2 py-1.5">
                  <option value={50000}>1 : 50 000 (topographic)</option>
                  <option value={10000}>1 : 10 000 (orthophoto)</option>
                </select>
              </label>
            )}
            {(calc === "distance" || calc === "gradient") && <Num label="Map distance" value={cm} onChange={setCm} suffix="cm" />}
            {calc === "area" && <><Num label="Length on map" value={l} onChange={setL} suffix="cm" /><Num label="Breadth on map" value={b} onChange={setB} suffix="cm" /></>}
            {calc === "gradient" && <><Num label="Higher point" value={hi} onChange={setHi} step={10} suffix="m" /><Num label="Lower point" value={lo} onChange={setLo} step={10} suffix="m" /></>}
            {calc === "declination" && (
              <>
                <Num label="Base declination (degrees)" value={dec.deg} onChange={(v) => setDec({ ...dec, deg: v })} step={1} suffix="°" />
                <Num label="…and minutes" value={dec.min} onChange={(v) => setDec({ ...dec, min: v })} step={1} suffix="'" />
                <Num label="Base year" value={dec.year} onChange={(v) => setDec({ ...dec, year: v })} step={1} />
                <Num label="Mean annual change" value={dec.ann} onChange={(v) => setDec({ ...dec, ann: v })} step={1} suffix="' / yr" />
                <label className="block text-sm"><span className="text-muted">Direction of change</span>
                  <select value={dec.dir} onChange={(e) => setDec({ ...dec, dir: e.target.value as "W" | "E" })} className="mt-0.5 w-full rounded-lg border border-line bg-bg px-2 py-1.5"><option value="W">Westwards</option><option value="E">Eastwards</option></select>
                </label>
                <Num label="Current year" value={dec.now} onChange={(v) => setDec({ ...dec, now: v })} step={1} />
              </>
            )}
            {calc === "ve" && <Num label="Vertical scale: 1 :" value={vs} onChange={setVs} step={500} />}
            {calc === "time" && <><Num label="Distance" value={km} onChange={setKm} suffix="km" /><Num label="Speed" value={sp} onChange={setSp} step={10} suffix="km/h" /></>}
          </div>
          <Working w={worked} />
          {calc === "declination" && (
            <div className="mt-3 grid items-end gap-3 sm:grid-cols-[200px_1fr]">
              <Num label="True bearing to convert" value={dec.tb} onChange={(v) => setDec({ ...dec, tb: v })} step={1} suffix="°" />
              <Working w={magneticBearing(dec.tb, worked.answer)} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <p className="font-semibold">{prob.q}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input value={ans} onChange={(e) => { setAns(e.target.value); setResult(null); }} onKeyDown={(e) => e.key === "Enter" && check()} inputMode="decimal" placeholder="Your answer" aria-label="Your answer"
              className="w-40 rounded-lg border border-line bg-bg px-3 py-2 outline-none focus:border-mapwork" />
            <span className="text-sm text-muted">{prob.unit}</span>
            <Button size="sm" onClick={check} disabled={!ans}><Check className="h-4 w-4" /> Check</Button>
            <Button size="sm" variant="secondary" onClick={() => { setSeed((s) => s + 1); setAns(""); setResult(null); }}><RefreshCw className="h-4 w-4" /> New question</Button>
          </div>
          <Feedback ok={result}>
            <strong>{result ? "Correct!" : "Not yet."}</strong> {result ? "Here is the working to copy into your exam answer:" : "Compare your working with the memo:"}
            <Working w={prob.w} />
          </Feedback>
        </div>
      )}
    </WidgetFrame>
  );
}
