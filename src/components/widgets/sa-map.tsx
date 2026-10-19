"use client";
/**
 * A simplified (schematic) map of South Africa, drawn from about 70 longitude/latitude
 * points. Good enough to show where weather systems and economic regions are –
 * not for measuring distances.
 */

export const MAP_W = 476;
export const MAP_H = 308;
const K = 14;
const LON0 = 8;
const LAT0 = -17;

/** Longitude/latitude (degrees, south negative) → SVG coordinates. */
export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * K, (LAT0 - lat) * K];
}

const pts = (list: [number, number][]) => list.map(([lo, la]) => project(lo, la).map((n) => n.toFixed(1)).join(",")).join(" ");

/** SA coastline from the Orange River mouth round to Kosi Bay. */
const COAST: [number, number][] = [
  [16.45, -28.63], [16.9, -29.3], [17.3, -30.4], [17.6, -31.0], [18.2, -31.9], [18.3, -32.6], [17.9, -32.95], [18.4, -33.9],
  [18.47, -34.36], [18.8, -34.08], [19.3, -34.6], [20.0, -34.83], [21.0, -34.4], [22.1, -34.2], [23.4, -34.1], [24.8, -34.2],
  [25.6, -34.0], [26.5, -33.75], [27.9, -33.05], [28.8, -32.3], [29.6, -31.6], [30.4, -30.8], [31.0, -29.9], [31.5, -29.2],
  [32.1, -28.6], [32.6, -27.6], [32.9, -26.86],
];

/** Land border from Kosi Bay north to the Limpopo, west along Botswana and down the Namibian border. */
const BORDER: [number, number][] = [
  [32.1, -26.84], [31.97, -25.95], [31.97, -25.4], [31.9, -24.5], [31.55, -23.2], [31.3, -22.4], [30.0, -22.2], [29.4, -22.2],
  [29.0, -22.4], [28.2, -22.6], [27.6, -23.2], [27.0, -23.65], [26.5, -24.4], [25.9, -24.7], [25.5, -25.6], [24.6, -25.8],
  [23.0, -25.3], [22.5, -25.9], [21.7, -26.8], [20.8, -26.85], [20.0, -24.75], [20.0, -28.4], [19.4, -28.9], [18.5, -28.9],
  [17.4, -28.7],
];

const LESOTHO: [number, number][] = [[28.0, -28.6], [28.8, -28.8], [29.4, -29.3], [29.2, -29.9], [28.4, -30.6], [27.6, -30.3], [27.0, -29.6], [27.4, -29.0]];
const ESWATINI: [number, number][] = [[31.3, -25.75], [32.0, -25.95], [32.1, -26.8], [31.8, -27.3], [31.0, -27.2], [30.8, -26.4]];

/** Neighbouring land (Namibia, Botswana, Zimbabwe, Mozambique) – drawn faintly behind SA. */
const AFRICA: [number, number][] = [
  [12.0, -17], [13.5, -20.5], [14.4, -22.5], [14.5, -24], [15.2, -27], ...COAST,
  [32.95, -26.0], [33.5, -25.3], [35.0, -24.6], [35.5, -23.8], [35.4, -22.1], [34.85, -19.8], [36.0, -18.9], [37.4, -17.6], [37.6, -17],
];

export const TOWNS: Record<string, [number, number]> = {
  "Cape Town": [18.42, -33.92],
  Durban: [31.03, -29.86],
  Johannesburg: [28.05, -26.2],
  Gqeberha: [25.6, -33.96],
  "East London": [27.9, -33.02],
  Bloemfontein: [26.2, -29.1],
  Polokwane: [29.45, -23.9],
  Upington: [21.25, -28.4],
  Kimberley: [24.76, -28.74],
};

export function SaBaseMap({ children, towns = ["Cape Town", "Durban", "Johannesburg", "Gqeberha", "Bloemfontein"], label = "Simplified map of South Africa", grid = false }: {
  children?: React.ReactNode; towns?: string[]; label?: string; grid?: boolean;
}) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="diagram rounded-xl" role="img" aria-label={label}>
      <rect width={MAP_W} height={MAP_H} fill="color-mix(in oklab, var(--water) 16%, var(--surface))" />
      {grid && [-20, -25, -30, -35].map((la) => {
        const y = project(0, la)[1];
        return <g key={la}><line x1={0} x2={MAP_W} y1={y} y2={y} stroke="var(--text-muted)" strokeOpacity={0.25} strokeDasharray="3 4" /><text x={4} y={y - 3} fontSize={9} className="muted">{-la}°S</text></g>;
      })}
      <polygon points={pts(AFRICA)} fill="var(--land)" stroke="var(--border)" strokeWidth={1} />
      <polygon points={pts([...COAST, ...BORDER])} fill="color-mix(in oklab, var(--t-mapwork) 18%, var(--land))" stroke="var(--map-ink)" strokeWidth={1.4} strokeLinejoin="round" />
      <polygon points={pts(LESOTHO)} fill="var(--land)" stroke="var(--map-ink)" strokeWidth={0.8} />
      <polygon points={pts(ESWATINI)} fill="var(--land)" stroke="var(--map-ink)" strokeWidth={0.8} />
      {children}
      {towns.map((t) => {
        const [x, y] = project(...TOWNS[t]);
        return (
          <g key={t}>
            <circle cx={x} cy={y} r={2.6} fill="var(--map-ink)" />
            <text x={x + 4} y={y - 3} fontSize={9} fontWeight={600}>{t}</text>
          </g>
        );
      })}
      <text x={MAP_W - 8} y={MAP_H - 8} fontSize={8} textAnchor="end" className="muted">Schematic – not to scale</text>
      <g transform={`translate(${MAP_W - 22}, 26)`}>
        <path d="M0,-14 L5,4 L0,0 L-5,4 Z" fill="var(--map-ink)" />
        <text y={14} fontSize={9} textAnchor="middle" fontWeight={700}>N</text>
      </g>
    </svg>
  );
}
