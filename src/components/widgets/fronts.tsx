"use client";
/** Shared drawing helpers for weather fronts on synoptic-style diagrams. */

export type Pt = [number, number];

export function sampleQuad(p0: Pt, p1: Pt, p2: Pt, n = 40): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return out;
}

/** Points spaced evenly along a polyline, with the unit tangent at each. */
function along(points: Pt[], spacing: number, offset: number) {
  const out: { p: Pt; t: Pt }[] = [];
  let carry = offset;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (!len) continue;
    const t: Pt = [(x2 - x1) / len, (y2 - y1) / len];
    let d = carry;
    while (d < len) {
      out.push({ p: [x1 + t[0] * d, y1 + t[1] * d], t });
      d += spacing;
    }
    carry = d - len;
  }
  return out;
}

const COLOURS = { cold: "#2563eb", warm: "#dc2626", occluded: "#9333ea" };

/**
 * Draws a front: blue triangles (cold), red semicircles (warm) or alternating
 * purple symbols (occluded). Symbols point the way the front is moving (`facing`).
 */
export function FrontLine({ points, kind, facing = [1, 0], size = 7 }: { points: Pt[]; kind: "cold" | "warm" | "occluded"; facing?: Pt; size?: number }) {
  const colour = COLOURS[kind];
  const d = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const marks = along(points, size * 3.2, size * 1.5);
  return (
    <g>
      <path d={d} fill="none" stroke={colour} strokeWidth={2.6} strokeLinecap="round" />
      {marks.map(({ p, t }, i) => {
        let n: Pt = [-t[1], t[0]];
        if (n[0] * facing[0] + n[1] * facing[1] < 0) n = [-n[0], -n[1]];
        const sym = kind === "occluded" ? (i % 2 ? "warm" : "cold") : kind;
        const a: Pt = [p[0] - t[0] * size * 0.8, p[1] - t[1] * size * 0.8];
        const b: Pt = [p[0] + t[0] * size * 0.8, p[1] + t[1] * size * 0.8];
        if (sym === "cold") {
          const apex: Pt = [p[0] + n[0] * size * 1.1, p[1] + n[1] * size * 1.1];
          return <path key={i} d={`M${a[0]},${a[1]} L${apex[0]},${apex[1]} L${b[0]},${b[1]} Z`} fill={colour} />;
        }
        // semicircle bulging towards n: choose sweep so the arc lies on the n side
        const cross = t[0] * n[1] - t[1] * n[0];
        return <path key={i} d={`M${a[0]},${a[1]} A${size * 0.8},${size * 0.8} 0 0 ${cross < 0 ? 1 : 0} ${b[0]},${b[1]} Z`} fill={colour} />;
      })}
    </g>
  );
}

/** A curved arrow round a pressure centre showing the direction of circulation. */
export function Spin({ cx, cy, r = 22, clockwise, colour = "var(--text-muted)" }: { cx: number; cy: number; r?: number; clockwise: boolean; colour?: string }) {
  const id = `spin-${clockwise ? "c" : "a"}`;
  const start: Pt = [cx - r, cy];
  const end: Pt = [cx, clockwise ? cy - r : cy + r];
  const start2: Pt = [cx + r, cy];
  const end2: Pt = [cx, clockwise ? cy + r : cy - r];
  const sweep = clockwise ? 1 : 0;
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={colour} /></marker>
      </defs>
      <path d={`M${start[0]},${start[1]} A${r},${r} 0 0 ${sweep} ${end[0]},${end[1]}`} fill="none" stroke={colour} strokeWidth={1.8} markerEnd={`url(#${id})`} />
      <path d={`M${start2[0]},${start2[1]} A${r},${r} 0 0 ${sweep} ${end2[0]},${end2[1]}`} fill="none" stroke={colour} strokeWidth={1.8} markerEnd={`url(#${id})`} />
    </g>
  );
}
