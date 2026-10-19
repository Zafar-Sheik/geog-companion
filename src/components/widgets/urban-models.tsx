"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Md, Segmented, WidgetFrame } from "./widget-frame";

const C = 150;
const pt = (b: number, r: number) => `${(C + r * Math.sin((b * Math.PI) / 180)).toFixed(1)},${(C - r * Math.cos((b * Math.PI) / 180)).toFixed(1)}`;
/** Annular sector between radii r1..r2 and bearings b1..b2 (clockwise from north). */
const sector = (b1: number, b2: number, r1: number, r2: number) => {
  const large = (b2 - b1 + 360) % 360 > 180 ? 1 : 0;
  return `M${pt(b1, r1)} L${pt(b1, r2)} A${r2},${r2} 0 ${large} 1 ${pt(b2, r2)} L${pt(b2, r1)} A${r1},${r1} 0 ${large} 0 ${pt(b1, r1)} Z`;
};
const circle = (r: number, cx = C, cy = C) => `M${cx - r},${cy} a${r},${r} 0 1 0 ${r * 2},0 a${r},${r} 0 1 0 ${-r * 2},0`;
/** Full ring between r1 and r2 (drawn with the even-odd fill rule). */
const ring = (r1: number, r2: number) => `${circle(r2)} ${circle(r1)}`;

interface Zone { name: string; colour: string; desc: string; d: string[] }
interface Model { id: string; title: string; summary: string; zones: Zone[] }

const MODELS: Model[] = [
  {
    id: "burgess", title: "Concentric zone (Burgess, 1925)",
    summary: "The city grows **outwards in rings** from the CBD. Land value is highest in the centre and falls with distance. Wealthier people live further out because they can afford to commute. **Criticism:** too simple – ignores transport routes, relief and planning.",
    zones: [
      { name: "CBD", colour: "#dc2626", desc: "Central Business District – offices, shops, banks; highest land values, tallest buildings.", d: [circle(28)] },
      { name: "Zone in transition", colour: "#f97316", desc: "Old housing being replaced by **light industry** and offices; **urban blight**, poverty, newcomers.", d: [ring(28, 58)] },
      { name: "Low-income residential", colour: "#facc15", desc: "Workers' housing close to jobs – small, older houses.", d: [ring(58, 88)] },
      { name: "Middle-income residential", colour: "#84cc16", desc: "Newer, larger houses with gardens.", d: [ring(88, 118)] },
      { name: "High-income / commuter zone", colour: "#0ea5e9", desc: "Large houses on big plots at the edge – rich commuters travel to the CBD.", d: [ring(118, 145)] },
    ],
  },
  {
    id: "hoyt", title: "Sector model (Hoyt, 1939)",
    summary: "Land uses grow outwards in **wedges (sectors) along transport routes** – e.g. industry along a railway, high-income housing along scenic high ground away from industry. **Strength:** recognises the role of transport. **Criticism:** ignores multiple centres.",
    zones: [
      { name: "CBD", colour: "#dc2626", desc: "Central Business District.", d: [circle(26)] },
      { name: "Light industry & wholesaling", colour: "#a855f7", desc: "Follows a **railway / main road** out of the city.", d: [sector(70, 110, 26, 145), sector(250, 280, 26, 145)] },
      { name: "Low-income residential", colour: "#facc15", desc: "Next to industry – close to jobs, but noise and pollution.", d: [sector(30, 70, 26, 145), sector(110, 150, 26, 145), sector(220, 250, 26, 145)] },
      { name: "Middle-income residential", colour: "#84cc16", desc: "Between the low- and high-income sectors.", d: [sector(150, 220, 26, 145), sector(280, 320, 26, 145), sector(0, 30, 26, 145)] },
      { name: "High-income residential", colour: "#0ea5e9", desc: "On **high ground**, with views, upwind and far from industry.", d: [sector(320, 360, 26, 145)] },
    ],
  },
  {
    id: "nuclei", title: "Multiple nuclei (Harris & Ullman, 1945)",
    summary: "Modern cities grow around **several centres (nuclei)**, not just one CBD – e.g. an airport, a university, a mall or an industrial park. Similar activities cluster together; incompatible ones (heavy industry and high-income housing) stay apart. Fits large, car-based cities best.",
    zones: [
      { name: "CBD", colour: "#dc2626", desc: "The original centre.", d: ["M120,110 h60 v50 h-60 Z"] },
      { name: "Light industry", colour: "#a855f7", desc: "Near the CBD and transport.", d: ["M180,60 h60 v100 h-60 Z"] },
      { name: "Low-income residential", colour: "#facc15", desc: "Near industry.", d: ["M60,60 h60 v50 h-60 Z", "M180,160 h60 v60 h-60 Z", "M120,160 h60 v40 h-60 Z"] },
      { name: "Middle-income residential", colour: "#84cc16", desc: "Large areas between nuclei.", d: ["M60,110 h60 v110 h-60 Z", "M120,40 h60 v70 h-60 Z", "M240,60 h40 v100 h-40 Z"] },
      { name: "High-income residential", colour: "#0ea5e9", desc: "Away from industry.", d: ["M20,40 h100 v20 h-100 Z", "M20,60 h40 v160 h-40 Z"] },
      { name: "Heavy industry", colour: "#57534e", desc: "On the outskirts, cheap land, near rail/port.", d: ["M180,220 h100 v40 h-100 Z"] },
      { name: "Outlying business district", colour: "#f97316", desc: "A second business centre, e.g. a regional mall.", d: ["M60,220 h60 v40 h-60 Z"] },
      { name: "Residential & industrial suburbs", colour: "#14b8a6", desc: "Separate nuclei on the edge.", d: ["M240,160 h40 v60 h-40 Z", "M120,200 h60 v60 h-60 Z"] },
    ],
  },
  {
    id: "apartheid", title: "Apartheid city model",
    summary: "Under apartheid (Group Areas Act, 1950) cities were **planned to separate race groups**. The CBD and the best land were reserved for white residents; **black townships** were placed on the **periphery**, far from jobs. **Buffer zones** (open land, rivers, railways, industry) separated group areas. Its effects – long commutes, inequality and spatial segregation – are still visible today.",
    zones: [
      { name: "CBD", colour: "#dc2626", desc: "Commercial core.", d: [circle(24)] },
      { name: "White residential areas", colour: "#0ea5e9", desc: "Close to the CBD and in the most attractive areas, with good services.", d: [sector(270, 450, 24, 100)] },
      { name: "Indian & coloured group areas", colour: "#84cc16", desc: "Separate areas, further out, often next to industry.", d: [sector(110, 200, 40, 110)] },
      { name: "Industry", colour: "#a855f7", desc: "Along railways – often acting as buffers between group areas.", d: [sector(90, 110, 24, 145), sector(200, 220, 24, 145)] },
      { name: "Buffer zones", colour: "#a3a3a3", desc: "Open land, rivers, railway lines or freeways keeping groups apart.", d: [sector(270, 450, 100, 112), sector(220, 270, 24, 145)] },
      { name: "Black townships", colour: "#facc15", desc: "On the **periphery**, far from the CBD and jobs – long, costly commutes; few services.", d: [sector(110, 220, 115, 145), sector(270, 450, 118, 145)] },
    ],
  },
  {
    id: "post", title: "Post-apartheid / modern SA city",
    summary: "Since 1994 cities are **desegregating** slowly. Business has **decentralised** to suburban malls and office parks; the old CBD has declined in places but is being **regenerated**. **Informal settlements** grow on the edge and on vacant land; **gated communities** and security estates are common. Planners use **development corridors** and **mixed-use, integrated housing** to reconnect the city.",
    zones: [
      { name: "CBD (old core, being renewed)", colour: "#dc2626", desc: "Some decay and crime, but urban renewal projects, student housing and loft apartments.", d: [circle(22)] },
      { name: "Decentralised business nodes", colour: "#f97316", desc: "Malls and office parks in the suburbs (e.g. Sandton, Umhlanga).", d: [circle(14, 230, 80), circle(12, 80, 210), circle(10, 220, 230)] },
      { name: "Integrated residential", colour: "#84cc16", desc: "Formerly white suburbs, now mixed by income rather than race.", d: [sector(270, 450, 22, 115)] },
      { name: "Townships (upgrading)", colour: "#facc15", desc: "Growing with new malls, RDP housing and better services.", d: [sector(110, 230, 60, 140)] },
      { name: "Informal settlements", colour: "#a16207", desc: "On the periphery and vacant land – rapid urbanisation outpaces housing delivery.", d: [sector(230, 270, 100, 145), sector(90, 110, 110, 145)] },
      { name: "Gated communities & estates", colour: "#0ea5e9", desc: "Secure, wealthy estates on the urban fringe.", d: [sector(300, 340, 118, 145), sector(20, 60, 118, 145)] },
      { name: "Development corridors", colour: "#a855f7", desc: "Transport routes with mixed land use linking townships to jobs (e.g. BRT routes).", d: ["M150,150 L60,260", "M150,150 L270,40"] },
    ],
  },
];

export function UrbanModels() {
  const [mid, setMid] = useState("burgess");
  const [zone, setZone] = useState<string | null>(null);
  const m = MODELS.find((x) => x.id === mid)!;
  const z = m.zones.find((x) => x.name === zone);

  return (
    <WidgetFrame title="Urban land-use models" instruction="Switch between models and tap a zone (on the map or in the key) to learn what happens there." colour="var(--t-settlement)">
      <Segmented options={MODELS.map((x) => ({ id: x.id, label: x.title.split(" (")[0] }))} value={mid} onChange={(v) => { setMid(v); setZone(null); }} colour="var(--t-settlement)" />
      <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
        <svg viewBox="0 0 300 300" className="diagram mx-auto max-w-[320px]" role="img" aria-label={m.title}>
          <rect width="300" height="300" rx="12" fill="var(--surface-2)" />
          {m.zones.map((zz) => zz.d.map((d, k) => {
            const line = zz.name === "Development corridors";
            return (
              <path key={zz.name + k} d={d} fill={line ? "none" : zz.colour} fillRule="evenodd" stroke={line ? zz.colour : "var(--surface)"} strokeWidth={line ? 8 : 1.5}
                fillOpacity={zone && zone !== zz.name ? 0.25 : 0.85} strokeOpacity={line && zone && zone !== zz.name ? 0.3 : 1}
                onClick={() => setZone(zz.name)} style={{ cursor: "pointer" }} />
            );
          }))}
          {(mid === "hoyt" || mid === "apartheid") && <line x1="0" y1="150" x2="300" y2="150" stroke="var(--map-ink)" strokeWidth="2" strokeDasharray="8 3 2 3" />}
          {(mid === "hoyt" || mid === "apartheid") && <text x="6" y="144" fontSize="8" fontWeight="700">railway / main road</text>}
        </svg>
        <div>
          <h4 className="font-display text-lg font-bold">{m.title}</h4>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {m.zones.map((zz) => (
              <li key={zz.name}>
                <button onClick={() => setZone(zz.name)} aria-pressed={zone === zz.name} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm", zone === zz.name ? "bg-settlement/15 font-semibold" : "hover:bg-surface-2")}>
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: zz.colour }} />{zz.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm" role="status">
            {z ? <Md text={`**${z.name}:** ${z.desc}`} /> : <Md text={m.summary} />}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
