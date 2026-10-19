"use client";
import { useState } from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { distToPolyline, pointInPolygon, toPath, type XY } from "./geo";
import { Md, Segmented, WidgetFrame } from "./widget-frame";

const W = 360;
const H = 240;
/** 1 px on this map = 10 m on the ground. */
const M_PER_PX = 10;

const RIVER: XY[] = [[0, 70], [60, 80], [110, 110], [150, 120], [200, 150], [250, 160], [300, 190], [360, 200]];
const ROADS: XY[][] = [[[20, 240], [90, 160], [180, 70], [240, 0]], [[90, 160], [200, 200], [360, 230]]];
const LANDUSE: { name: string; colour: string; poly: XY[] }[] = [
  { name: "Farmland", colour: "#facc15", poly: [[0, 0], [170, 0], [130, 60], [0, 50]] },
  { name: "Farmland", colour: "#facc15", poly: [[200, 0], [360, 0], [360, 150], [260, 130], [220, 90]] },
  { name: "Residential", colour: "#f97316", poly: [[40, 120], [130, 140], [150, 200], [60, 230], [20, 180]] },
  { name: "Forest", colour: "#16a34a", poly: [[200, 180], [360, 215], [360, 240], [170, 240]] },
];
const BUILDINGS: { id: number; type: "House" | "School" | "Clinic" | "Shop"; at: XY; people: number }[] = [
  { id: 1, type: "House", at: [70, 140], people: 5 },
  { id: 2, type: "House", at: [100, 128], people: 4 },
  { id: 3, type: "School", at: [80, 190], people: 640 },
  { id: 4, type: "Clinic", at: [125, 170], people: 30 },
  { id: 5, type: "House", at: [140, 136], people: 6 },
  { id: 6, type: "Shop", at: [55, 165], people: 12 },
  { id: 7, type: "House", at: [190, 165], people: 3 },
  { id: 8, type: "House", at: [235, 172], people: 7 },
  { id: 9, type: "School", at: [280, 110], people: 410 },
  { id: 10, type: "House", at: [30, 90], people: 4 },
];
const ICON = { House: "🏠", School: "🏫", Clinic: "🏥", Shop: "🏪" };

type Layer = "elevation" | "landuse" | "river" | "roads" | "buildings";
const LAYER_INFO: Record<Layer, { label: string; kind: string }> = {
  elevation: { label: "Elevation", kind: "Raster (grid of cells)" },
  landuse: { label: "Land use", kind: "Vector – polygons" },
  river: { label: "River", kind: "Vector – line" },
  roads: { label: "Roads", kind: "Vector – lines" },
  buildings: { label: "Buildings", kind: "Vector – points" },
};

const elev = (x: number, y: number) => 1200 + 180 * Math.exp(-(((x - 300) / 90) ** 2 + ((y - 60) / 70) ** 2)) - 60 * Math.exp(-((distToPolyline([x, y], RIVER) / 50) ** 2)) - y * 0.25;

export function GisLayers() {
  const [on, setOn] = useState<Layer[]>(["landuse", "river", "roads", "buildings"]);
  const [tool, setTool] = useState<"none" | "buffer" | "query" | "overlay">("buffer");
  const [buffer, setBuffer] = useState(25);
  const [query, setQuery] = useState<"School" | "Clinic" | "House">("School");
  const [sel, setSel] = useState<number | null>(null);
  const toggle = (l: Layer) => setOn((x) => (x.includes(l) ? x.filter((y) => y !== l) : [...x, l]));

  const atRisk = BUILDINGS.filter((b) => distToPolyline(b.at, RIVER) <= buffer);
  const cells: { x: number; y: number; ok: boolean }[] = [];
  if (tool === "overlay") {
    for (let x = 0; x < W; x += 15) for (let y = 0; y < H; y += 15) {
      const c: XY = [x + 7.5, y + 7.5];
      const farm = LANDUSE.some((l) => l.name === "Farmland" && pointInPolygon(c, l.poly));
      const nearRoad = Math.min(...ROADS.map((r) => distToPolyline(c, r))) <= 40;
      const dry = distToPolyline(c, RIVER) > buffer;
      cells.push({ x, y, ok: farm && nearRoad && dry });
    }
  }

  return (
    <WidgetFrame title="GIS layer lab" instruction="Switch layers on and off, then use the GIS tools: buffering, attribute queries and overlay analysis." colour="var(--t-mapwork)">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="diagram rounded-xl border border-line" role="img" aria-label="GIS map with layers">
            <rect width={W} height={H} fill="#f5f5f4" />
            {on.includes("elevation") && Array.from({ length: 24 }, (_, i) => Array.from({ length: 16 }, (_, j) => {
              const e = elev(i * 15 + 7.5, j * 15 + 7.5);
              const t = Math.max(0, Math.min(1, (e - 1100) / 300));
              return <rect key={`${i}-${j}`} x={i * 15} y={j * 15} width="15" height="15" fill={`hsl(${120 - t * 100}, 55%, ${70 - t * 30}%)`} />;
            }))}
            {on.includes("landuse") && LANDUSE.map((l, i) => <path key={i} d={toPath(l.poly, true)} fill={l.colour} fillOpacity={on.includes("elevation") ? 0.35 : 0.55} stroke={l.colour} />)}
            {tool === "overlay" && cells.filter((c) => c.ok).map((c) => <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="15" height="15" fill="#2563eb" fillOpacity="0.55" stroke="white" strokeWidth="0.5" />)}
            {tool === "buffer" && <path d={toPath(RIVER)} fill="none" stroke="#ef4444" strokeOpacity="0.25" strokeWidth={buffer * 2} strokeLinejoin="round" strokeLinecap="round" />}
            {on.includes("river") && <path d={toPath(RIVER)} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />}
            {on.includes("roads") && ROADS.map((r, i) => <g key={i}><path d={toPath(r)} fill="none" stroke="#444" strokeWidth="5" /><path d={toPath(r)} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="6 5" /></g>)}
            {on.includes("buildings") && BUILDINGS.map((b) => {
              const risk = tool === "buffer" && atRisk.includes(b);
              const hit = tool === "query" && b.type === query;
              return (
                <g key={b.id} onClick={() => setSel(b.id)} style={{ cursor: "pointer" }}>
                  {(risk || hit || sel === b.id) && <circle cx={b.at[0]} cy={b.at[1]} r="11" fill="none" stroke={risk ? "#dc2626" : hit ? "#7c3aed" : "#0f766e"} strokeWidth="3" />}
                  <text x={b.at[0]} y={b.at[1] + 5} fontSize="13" textAnchor="middle">{ICON[b.type]}</text>
                </g>
              );
            })}
            <g transform={`translate(${W - 90},${H - 14})`}><rect width="50" height="4" fill="var(--map-ink)" /><text x="56" y="5" fontSize="9">500 m</text></g>
          </svg>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(LAYER_INFO) as Layer[]).map((l) => (
              <button key={l} onClick={() => toggle(l)} aria-pressed={on.includes(l)} className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold", on.includes(l) ? "border-mapwork bg-mapwork/15 text-mapwork" : "border-line text-muted")}>
                <Layers className="h-3 w-3" />{LAYER_INFO[l].label}<span className="font-normal opacity-70">· {LAYER_INFO[l].kind}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <Segmented options={[{ id: "buffer", label: "Buffer" }, { id: "query", label: "Query" }, { id: "overlay", label: "Overlay" }, { id: "none", label: "Off" }]} value={tool} onChange={setTool} colour="var(--t-mapwork)" />
          {tool === "buffer" && (
            <div className="rounded-xl bg-surface-2 p-3">
              <label>Flood buffer around the river: <strong>{buffer * M_PER_PX} m</strong>
                <input type="range" min={5} max={60} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className="w-full accent-[var(--danger)]" />
              </label>
              <p className="mt-1"><strong>{atRisk.length}</strong> building(s) fall inside the buffer – {atRisk.reduce((s, b) => s + b.people, 0)} people at risk of flooding.</p>
              <Md className="mt-2 text-muted" text="**Buffering** draws a zone of a set distance around a point, line or polygon – e.g. a flood zone along a river, a noise zone around an airport, or 'no-build' zones." />
            </div>
          )}
          {tool === "query" && (
            <div className="rounded-xl bg-surface-2 p-3">
              <div className="flex flex-wrap gap-1.5">{(["School", "Clinic", "House"] as const).map((q) => <button key={q} onClick={() => setQuery(q)} aria-pressed={query === q} className={cn("rounded-lg border px-2 py-1 text-xs", query === q ? "border-settlement bg-settlement/15" : "border-line")}>type = &quot;{q}&quot;</button>)}</div>
              <Md className="mt-2 text-muted" text="An **attribute query** selects features by their **attribute data** (the information stored about them) rather than by location." />
            </div>
          )}
          {tool === "overlay" && (
            <div className="rounded-xl bg-surface-2 p-3">
              <p>Site for a new farm co-operative: <strong>farmland</strong> AND <strong>within 400 m of a road</strong> AND <strong>outside the {buffer * M_PER_PX} m flood buffer</strong>. Blue cells meet all three.</p>
              <Md className="mt-2 text-muted" text="**Overlay analysis** combines two or more layers to find places that meet several conditions at once – the heart of GIS decision-making." />
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-xs">
              <caption className="p-1 text-left font-bold text-muted">Attribute table – Buildings layer</caption>
              <thead className="bg-surface-2"><tr><th className="px-2 py-1 text-left">ID</th><th className="px-2 py-1 text-left">Type</th><th className="px-2 py-1 text-left">People</th><th className="px-2 py-1 text-left">x, y</th></tr></thead>
              <tbody>
                {BUILDINGS.map((b) => (
                  <tr key={b.id} onClick={() => setSel(b.id)} className={cn("cursor-pointer border-t border-line", sel === b.id && "bg-brand-soft", tool === "query" && b.type === query && "font-bold text-settlement", tool === "buffer" && atRisk.includes(b) && "text-danger")}>
                    <td className="px-2 py-0.5">{b.id}</td><td className="px-2 py-0.5">{b.type}</td><td className="px-2 py-0.5">{b.people}</td><td className="px-2 py-0.5">{b.at.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">The <strong>x, y</strong> column is <strong>spatial data</strong> (where). Type and people are <strong>attribute data</strong> (what).</p>
        </div>
      </div>
    </WidgetFrame>
  );
}
