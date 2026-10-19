"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { project, SaBaseMap } from "./sa-map";
import { Md, WidgetFrame } from "./widget-frame";

type Layer = "industry" | "sez" | "mining" | "farming";

interface Place { name: string; at: [number, number]; text: string; r?: number }

const LAYERS: Record<Layer, { label: string; colour: string; icon: string; places: Place[] }> = {
  industry: {
    label: "Core industrial regions", colour: "#7c3aed", icon: "🏭",
    places: [
      { name: "Gauteng (PWV)", at: [28.1, -26.1], r: 22, text: "**Gauteng (Pretoria–Witwatersrand–Vereeniging)** – SA's largest industrial region and economic heartland (about a third of GDP). **Factors:** started with **gold mining** (1886); large **market** and **labour** force; **coal** and **water** (Vaal Dam) nearby; dense road, rail and air links (OR Tambo); financial services (JSE). **Problem:** far from ports – raw materials and exports must be transported." },
      { name: "Durban–Pinetown (eThekwini)", at: [30.9, -29.8], r: 13, text: "**Durban–Pinetown** – second largest. Built around **Durban harbour**, the **busiest container port in sub-Saharan Africa**. Industries: **oil refining**, chemicals, **motor vehicles** (Toyota, Prospecton), food processing (sugar), textiles, paper. Close to Gauteng via the N3 corridor. Labour from a large population in KZN." },
      { name: "Nelson Mandela Bay (PE–Uitenhage)", at: [25.5, -33.85], r: 11, text: "**Nelson Mandela Bay (Gqeberha–Kariega/Uitenhage)** – the centre of SA's **automotive industry** (VW, Isuzu, components). Ports of **Gqeberha** and **Ngqura** (Coega). **Problems:** far from Gauteng's market and raw materials; reliance on one industry makes it vulnerable." },
      { name: "South-Western Cape", at: [18.6, -33.9], r: 12, text: "**South-Western Cape (Cape Town)** – **Cape Town harbour**; industries based on **agriculture** (food processing, **wine**, fruit canning), **clothing & textiles**, fishing, oil refining, tourism & services. **Problems:** far from Gauteng and from coal/minerals; limited water." },
    ],
  },
  sez: {
    label: "SEZs / IDZs & SDIs", colour: "#0891b2", icon: "⚓",
    places: [
      { name: "Coega SEZ", at: [25.68, -33.77], text: "**Coega** (near Gqeberha) – SA's largest **Special Economic Zone (SEZ)**, with the deep-water **Port of Ngqura**. Attracts export industries: automotive, renewable energy, logistics, agro-processing. Creates jobs in a region with high unemployment." },
      { name: "East London IDZ", at: [27.87, -33.03], text: "**East London** – automotive (Mercedes-Benz), aquaculture and agro-processing; linked to the port of East London." },
      { name: "Richards Bay SEZ", at: [32.04, -28.78], text: "**Richards Bay** – deep-water port that exports **coal** (Richards Bay Coal Terminal); aluminium smelting, heavy minerals, chemicals." },
      { name: "Dube TradePort", at: [31.12, -29.61], text: "**Dube TradePort** (next to King Shaka Airport, north of Durban) – air-freight logistics, agriculture (perishables) and electronics; linked to Durban port." },
      { name: "Saldanha Bay IDZ", at: [17.95, -33.0], text: "**Saldanha Bay** – deep natural harbour that exports **iron ore** from Sishen by rail; focus on **oil & gas** services and marine repair." },
      { name: "Maputo Development Corridor", at: [30.7, -25.6], text: "**Maputo Development Corridor (SDI)** – upgraded **N4 toll road**, railway and border post linking **Gauteng with the port of Maputo** in Mozambique. A Spatial Development Initiative to attract investment along a transport route." },
    ],
  },
  mining: {
    label: "Mining", colour: "#a16207", icon: "⛏️",
    places: [
      { name: "Gold – Witwatersrand", at: [27.3, -26.4], text: "**Gold** – Witwatersrand basin (Gauteng, Free State, North West). Built SA's economy since 1886. Now **declining**: deep, expensive mines (over 3 km), rising costs, lower grades." },
      { name: "Platinum – Bushveld", at: [27.24, -25.67], text: "**Platinum group metals** – **Bushveld Complex** (Rustenburg, North West & Limpopo). SA has about **80% of the world's platinum reserves**; used in catalytic converters, jewellery and electronics. Challenges: labour unrest, electricity supply, price changes." },
      { name: "Coal – Mpumalanga", at: [29.23, -25.87], text: "**Coal** – Mpumalanga Highveld (eMalahleni/Witbank, Secunda). Fuels about 80% of SA's **electricity** (Eskom power stations) and **Sasol** synthetic fuels; exported via Richards Bay. Causes air pollution and acid mine drainage." },
      { name: "Diamonds – Kimberley", at: [24.76, -28.74], text: "**Diamonds** – Kimberley (Big Hole), and alluvial/marine diamonds along the west coast." },
      { name: "Iron ore & manganese – N Cape", at: [22.99, -27.78], text: "**Iron ore** (Sishen) and **manganese** (Kalahari field – the world's largest reserve) in the Northern Cape; exported via Saldanha and Port Elizabeth/Ngqura." },
    ],
  },
  farming: {
    label: "Agriculture", colour: "#16a34a", icon: "🌾",
    places: [
      { name: "Maize triangle", at: [27.0, -27.3], r: 18, text: "**Maize** – the staple food. Grown in the **'maize triangle'** (Free State, North West, Mpumalanga): summer rainfall, deep soils, flat land for mechanisation. Food security depends on it; droughts (El Niño) cut yields." },
      { name: "Sugar cane – KZN coast", at: [31.4, -29.3], r: 10, text: "**Sugar cane** – KZN coast and Mpumalanga lowveld: hot, humid, frost-free, high rainfall. Processed in mills (secondary industry) – a key employer in rural KZN." },
      { name: "Wheat – Swartland", at: [18.8, -33.3], r: 9, text: "**Wheat** – Swartland (Western Cape) with **winter rainfall**; also irrigated in the Free State and Northern Cape." },
      { name: "Fruit & wine – Boland", at: [19.2, -33.8], r: 8, text: "**Deciduous fruit & wine** – Western Cape valleys (Mediterranean climate). Major **export** earners; also tourism (wine routes)." },
      { name: "Citrus – Limpopo", at: [30.4, -23.9], r: 9, text: "**Citrus** – Limpopo, Mpumalanga and Eastern Cape (Sundays River). SA is one of the world's biggest citrus exporters." },
      { name: "Sheep – Karoo", at: [22.6, -31.9], r: 14, text: "**Sheep & goats** (wool, mutton, mohair) – the dry **Karoo**; extensive farming on large farms." },
    ],
  },
};

/** Clickable economic map of South Africa. */
export function SaEconomy({ layers = ["industry", "sez", "mining", "farming"] as Layer[] }: { layers?: Layer[] }) {
  const [on, setOn] = useState<Layer[]>([layers[0]]);
  const [sel, setSel] = useState<Place | null>(null);

  return (
    <WidgetFrame title="South Africa's economic map" instruction="Switch layers on and tap any symbol for the facts examiners love." colour="var(--t-economic)">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {layers.map((l) => (
          <button key={l} onClick={() => setOn((x) => (x.includes(l) ? x.filter((y) => y !== l) : [...x, l]))} aria-pressed={on.includes(l)}
            className={cn("flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold", on.includes(l) ? "text-white" : "border-line text-muted")}
            style={on.includes(l) ? { background: LAYERS[l].colour, borderColor: LAYERS[l].colour } : undefined}>
            {LAYERS[l].icon} {LAYERS[l].label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <SaBaseMap towns={["Cape Town", "Durban", "Johannesburg", "Gqeberha", "Bloemfontein", "Kimberley", "Polokwane"]} label="Economic map of South Africa">
          {on.flatMap((l) => LAYERS[l].places.map((p) => {
            const [x, y] = project(...p.at);
            const active = sel?.name === p.name;
            return (
              <g key={p.name} onClick={() => setSel(p)} onKeyDown={(e) => e.key === "Enter" && setSel(p)} tabIndex={0} role="button" aria-label={p.name} style={{ cursor: "pointer" }}>
                {p.r ? <circle cx={x} cy={y} r={p.r} fill={LAYERS[l].colour} fillOpacity={active ? 0.55 : 0.3} stroke={LAYERS[l].colour} strokeWidth={active ? 3 : 1.5} />
                  : <rect x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={LAYERS[l].colour} stroke="white" strokeWidth={active ? 3 : 1} />}
                <text x={x} y={y + 4} fontSize="10" textAnchor="middle">{LAYERS[l].icon}</text>
              </g>
            );
          }))}
        </SaBaseMap>
        <div className="rounded-xl bg-surface-2 p-3 text-sm" role="status">
          {sel ? (<><h4 className="mb-1 font-display font-bold">{sel.name}</h4><Md text={sel.text} /></>) : (
            <div className="text-muted">
              <p>Tap a symbol on the map.</p>
              <p className="mt-2"><strong className="text-fg">Exam tip:</strong> for any industrial region know the <strong className="text-fg">factors</strong> that favoured it (raw materials, power, water, labour, market, transport, capital, government policy) and the <strong className="text-fg">problems</strong> it faces.</p>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}
