/** Small geometry helpers for the GIS widgets. */
export type XY = [number, number];

export function pointInPolygon([x, y]: XY, poly: XY[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function distToSegment([px, py]: XY, [ax, ay]: XY, [bx, by]: XY) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function distToPolyline(p: XY, line: XY[]) {
  let d = Infinity;
  for (let i = 0; i < line.length - 1; i++) d = Math.min(d, distToSegment(p, line[i], line[i + 1]));
  return d;
}

export const toPath = (pts: XY[], close = false) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") + (close ? " Z" : "");
