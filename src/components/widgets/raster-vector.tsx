"use client";
import { useState } from "react";
import { distToPolyline, pointInPolygon, toPath, type XY } from "./geo";
import { WidgetFrame } from "./widget-frame";

const W = 240;
const H = 180;
const DAM: XY[] = [[60, 40], [120, 30], [150, 60], [130, 95], [80, 100], [50, 75]];
const RIVER: XY[] = [[130, 95], [150, 120], [175, 135], [200, 165], [240, 175]];
const TOWNS: XY[] = [[190, 60], [40, 140]];

/** The same features as vector data and as raster data at different resolutions. */
export function RasterVector() {
  const [cell, setCell] = useState(12);
  const cells: { x: number; y: number; fill: string }[] = [];
  for (let x = 0; x < W; x += cell) {
    for (let y = 0; y < H; y += cell) {
      const c: XY = [x + cell / 2, y + cell / 2];
      let fill = "#d9f99d";
      if (pointInPolygon(c, DAM)) fill = "#3b82f6";
      else if (distToPolyline(c, RIVER) < Math.max(3, cell / 2)) fill = "#60a5fa";
      else if (TOWNS.some((t) => Math.abs(t[0] - c[0]) <= cell / 2 + 2 && Math.abs(t[1] - c[1]) <= cell / 2 + 2)) fill = "#dc2626";
      cells.push({ x, y, fill });
    }
  }
  return (
    <WidgetFrame title="Raster vs vector data" instruction="The same dam, river and towns stored two ways. Drag the slider to change the raster resolution (cell / pixel size)." colour="var(--t-mapwork)">
      <div className="grid gap-4 sm:grid-cols-2">
        <figure>
          <svg viewBox={`0 0 ${W} ${H}`} className="diagram rounded-xl border border-line" role="img" aria-label="Vector representation">
            <rect width={W} height={H} fill="#ecfccb" />
            <path d={toPath(DAM, true)} fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <path d={toPath(RIVER)} fill="none" stroke="#3b82f6" strokeWidth="3" />
            {TOWNS.map((t, i) => <circle key={i} cx={t[0]} cy={t[1]} r="5" fill="#dc2626" />)}
            {DAM.map((p, i) => <circle key={`n${i}`} cx={p[0]} cy={p[1]} r="2.5" fill="#111" />)}
          </svg>
          <figcaption className="mt-1 text-sm"><strong>Vector:</strong> points (towns), lines (river) and polygons (dam) stored as x,y coordinates. The black dots are the stored vertices.</figcaption>
        </figure>
        <figure>
          <svg viewBox={`0 0 ${W} ${H}`} className="diagram rounded-xl border border-line" role="img" aria-label={`Raster representation with ${cell} pixel cells`}>
            {cells.map((c) => <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={cell} height={cell} fill={c.fill} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.5" />)}
          </svg>
          <figcaption className="mt-1 text-sm"><strong>Raster:</strong> a grid of cells (pixels), each holding one value. Cell size = {cell * 5} m → {cell <= 6 ? "high" : cell <= 16 ? "medium" : "low"} spatial resolution.</figcaption>
        </figure>
      </div>
      <input type="range" min={4} max={30} value={cell} onChange={(e) => setCell(Number(e.target.value))} className="mt-3 w-full accent-[var(--t-mapwork)]" aria-label="Raster cell size" />
      <div className="mt-3 overflow-x-auto rounded-xl border border-line text-sm">
        <table className="w-full">
          <thead className="bg-surface-2"><tr><th className="px-3 py-2 text-left"></th><th className="px-3 py-2 text-left">Vector</th><th className="px-3 py-2 text-left">Raster</th></tr></thead>
          <tbody>
            <tr className="border-t border-line"><td className="px-3 py-1.5 font-semibold">Best for</td><td className="px-3 py-1.5">Features with clear boundaries: roads, rivers, borders, buildings</td><td className="px-3 py-1.5">Continuous data: height, temperature, rainfall, satellite images</td></tr>
            <tr className="border-t border-line"><td className="px-3 py-1.5 font-semibold">Advantages</td><td className="px-3 py-1.5">Accurate shapes; small files; looks sharp when zoomed</td><td className="px-3 py-1.5">Simple structure; easy overlay; good for remote sensing</td></tr>
            <tr className="border-t border-line"><td className="px-3 py-1.5 font-semibold">Disadvantages</td><td className="px-3 py-1.5">More complex to process; poor for continuous data</td><td className="px-3 py-1.5">Large files; blocky (&lsquo;pixelated&rsquo;) edges; accuracy depends on cell size</td></tr>
          </tbody>
        </table>
      </div>
    </WidgetFrame>
  );
}
