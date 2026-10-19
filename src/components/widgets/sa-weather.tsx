"use client";
import { useState } from "react";
import { Snowflake, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { project, SaBaseMap } from "./sa-map";
import { Md, WidgetFrame } from "./widget-frame";

type Season = "summer" | "winter";
type Feature = "none" | "berg" | "coastal-low" | "moisture-front" | "cold-front" | "tropical-cyclone" | "cape-doctor";

const FEATURES: { id: Feature; label: string; seasons: Season[]; text: string }[] = [
  { id: "none", label: "Pressure cells only", seasons: ["summer", "winter"], text: "" },
  {
    id: "berg", label: "Berg wind", seasons: ["winter"],
    text: "**Berg winds** happen mostly in **winter** when the **Kalahari High** sits over the plateau and a **coastal low** is near the coast. Air flows **off the plateau, down the escarpment** towards the low. As it sinks it is **compressed and warms adiabatically** (about 1 °C per 100 m), so the coast gets **hot, dry, dusty offshore winds**. Temperatures can jump by 10 °C or more; fire risk and discomfort increase. When the coastal low passes, a **cold front** often follows and temperatures drop sharply.",
  },
  {
    id: "coastal-low", label: "Coastal lows", seasons: ["winter", "summer"],
    text: "**Coastal lows** are small, shallow low-pressure cells that form on the **west coast** and travel **along the coast, around the country, from west to east** (anticlockwise around SA). They form where offshore (berg) air sinks down the escarpment. Ahead of a coastal low: warm, dry **berg winds**; behind it: cool, moist **onshore winds**, low cloud, fog and drizzle. They are often followed by a cold front.",
  },
  {
    id: "moisture-front", label: "Moisture front & line thunderstorms", seasons: ["summer"],
    text: "In **summer** moist air flows in from the **Indian Ocean** (around the South Indian High) and meets **dry air** from the west/interior along a boundary called the **moisture front** (a dry line). The warm, moist air is forced to rise over the denser dry air → **cumulonimbus clouds** form in a line → **line thunderstorms** with heavy rain, lightning and sometimes hail over the **Highveld** in the afternoon.",
  },
  {
    id: "cold-front", label: "Cold fronts / mid-latitude cyclones", seasons: ["winter"],
    text: "In **winter** the pressure belts shift **north** (the sun is overhead in the Northern Hemisphere), so **mid-latitude cyclones** and their **cold fronts** reach the **south-western Cape**. This is why Cape Town has **winter rainfall** (a Mediterranean climate). After the front: cold, snow on the mountains, rising pressure, clearing skies.",
  },
  {
    id: "tropical-cyclone", label: "Tropical cyclones", seasons: ["summer"],
    text: "In **late summer** (January–March) sea temperatures in the **Mozambique Channel** are above **26.5 °C**, so **tropical cyclones** can form. Most move west/south-west towards Mozambique and Madagascar; a few send heavy rain into **Limpopo, Mpumalanga and KwaZulu-Natal** (e.g. Domoina 1984, Eline 2000, Idai 2019, Freddy 2023).",
  },
  {
    id: "cape-doctor", label: "Cape Doctor (south-easter)", seasons: ["summer"],
    text: "In **summer** the **South Atlantic High** moves south. Air flowing anticlockwise around it reaches the Cape as a strong **south-easterly** wind – the **Cape Doctor** – which blows pollution away from Cape Town and creates the 'table cloth' cloud on Table Mountain.",
  },
];

/** Anticyclone ("H") with anticlockwise arrows – Southern Hemisphere. */
function High({ lon, lat, name }: { lon: number; lat: number; name: string }) {
  const [x, y] = project(lon, lat);
  return (
    <g>
      <circle cx={x} cy={y} r={30} fill="color-mix(in oklab, var(--t-climate) 10%, transparent)" stroke="var(--t-climate)" strokeWidth={1.2} strokeDasharray="4 3" />
      <path d={`M${x + 30},${y} A30,30 0 0 0 ${x},${y - 30}`} fill="none" stroke="var(--t-climate)" strokeWidth={1.6} markerEnd="url(#arr-blue)" />
      <path d={`M${x - 30},${y} A30,30 0 0 0 ${x},${y + 30}`} fill="none" stroke="var(--t-climate)" strokeWidth={1.6} markerEnd="url(#arr-blue)" />
      <text x={x} y={y + 7} textAnchor="middle" fontSize={22} fontWeight={800} style={{ fill: "var(--t-climate)" }}>H</text>
      <text x={x} y={y + 44} textAnchor="middle" fontSize={9} fontWeight={700}>{name}</text>
    </g>
  );
}

function Low({ lon, lat, name, small }: { lon: number; lat: number; name?: string; small?: boolean }) {
  const [x, y] = project(lon, lat);
  return (
    <g>
      <text x={x} y={y + (small ? 5 : 8)} textAnchor="middle" fontSize={small ? 14 : 22} fontWeight={800} style={{ fill: "var(--danger)" }}>L</text>
      {name && <text x={x} y={y + (small ? 18 : 24)} textAnchor="middle" fontSize={9} fontWeight={700}>{name}</text>}
    </g>
  );
}

function Arrow({ from, to, colour, dashed }: { from: [number, number]; to: [number, number]; colour: string; dashed?: boolean }) {
  const [x1, y1] = project(...from);
  const [x2, y2] = project(...to);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={3} strokeDasharray={dashed ? "6 4" : undefined} markerEnd={colour === "var(--danger)" ? "url(#arr-red)" : "url(#arr-blue)"} />;
}

export function SaWeather() {
  const [season, setSeason] = useState<Season>("winter");
  const [feature, setFeature] = useState<Feature>("none");
  const f = FEATURES.find((x) => x.id === feature)!;
  const available = FEATURES.filter((x) => x.seasons.includes(season));
  const summer = season === "summer";

  const pickSeason = (s: Season) => {
    setSeason(s);
    if (!FEATURES.find((x) => x.id === feature)!.seasons.includes(s)) setFeature("none");
  };

  return (
    <WidgetFrame title="South Africa's weather systems" instruction="Switch seasons to see the pressure cells shift, then switch on a weather feature." colour="var(--t-climate)">
      <div className="mb-3 flex flex-wrap gap-2">
        <button onClick={() => pickSeason("summer")} aria-pressed={summer} className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold", summer ? "bg-economic text-white" : "bg-surface-2 text-muted")}><Sun className="h-4 w-4" /> Summer</button>
        <button onClick={() => pickSeason("winter")} aria-pressed={!summer} className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold", !summer ? "bg-climate text-white" : "bg-surface-2 text-muted")}><Snowflake className="h-4 w-4" /> Winter</button>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {available.map((x) => (
          <button key={x.id} onClick={() => setFeature(x.id)} aria-pressed={feature === x.id}
            className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold", feature === x.id ? "border-climate bg-climate/10 text-climate" : "border-line text-muted hover:text-fg")}>{x.label}</button>
        ))}
      </div>
      <SaBaseMap grid label={`South Africa in ${season} with pressure systems`}>
        <defs>
          <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--t-climate)" /></marker>
          <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--danger)" /></marker>
        </defs>
        {/* Pressure cells shift ~5° north in winter */}
        <High lon={summer ? 11 : 12.5} lat={summer ? -33.5 : -29} name="South Atlantic High" />
        <High lon={summer ? 38 : 37} lat={summer ? -34.5 : -31} name="South Indian High" />
        {summer ? <Low lon={23.5} lat={-26.5} name="Heat low (interior)" /> : <High lon={25} lat={-25.5} name="Kalahari High" />}

        {feature === "berg" && (
          <g>
            <Low lon={30.2} lat={-31.6} small name="Coastal low" />
            <Arrow from={[27.6, -28.6]} to={[30.4, -30.6]} colour="var(--danger)" />
            <Arrow from={[25.5, -31.0]} to={[25.4, -33.3]} colour="var(--danger)" />
            <text {...xy(26.6, -30.2)} fontSize={10} fontWeight={700} style={{ fill: "var(--danger)" }}>hot, dry, sinking air</text>
          </g>
        )}
        {feature === "coastal-low" && (
          <g>
            {[[17.6, -31.2], [20.5, -35.2], [26.5, -34.3], [30.8, -31.1]].map(([lo, la], i) => <Low key={i} lon={lo} lat={la} small name={i === 0 ? "forms here" : undefined} />)}
            <path d={`M${project(16.6, -30.4).join(",")} Q${project(19, -36.5).join(",")} ${project(25, -35).join(",")} T${project(31.6, -30.4).join(",")}`} fill="none" stroke="var(--danger)" strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#arr-red)" />
          </g>
        )}
        {feature === "moisture-front" && (
          <g>
            <path d={`M${project(26.2, -22.8).join(",")} Q${project(25.2, -27).join(",")} ${project(26.8, -31.2).join(",")}`} fill="none" stroke="#16a34a" strokeWidth={3} />
            {[[25.9, -24], [25.5, -26], [25.6, -28], [26.2, -30]].map(([lo, la], i) => { const [x, y] = project(lo, la); return <text key={i} x={x + 6} y={y} fontSize={16}>⛈️</text>; })}
            <Arrow from={[34, -27]} to={[28.3, -26.8]} colour="var(--t-climate)" />
            <Arrow from={[19, -27]} to={[23.6, -27.4]} colour="var(--danger)" dashed />
            <text {...xy(29, -25.3)} fontSize={9} fontWeight={700} style={{ fill: "var(--t-climate)" }}>moist air (Indian Ocean)</text>
            <text {...xy(17.6, -25.8)} fontSize={9} fontWeight={700} style={{ fill: "var(--danger)" }}>dry air</text>
            <text {...xy(22.2, -22.6)} fontSize={9} fontWeight={700} style={{ fill: "#16a34a" }}>moisture front</text>
          </g>
        )}
        {feature === "cold-front" && (
          <g>
            <Low lon={19} lat={-38.3} name="Mid-latitude cyclone" />
            <path d={`M${project(19.6, -37.6).join(",")} Q${project(17, -35.5).join(",")} ${project(14.5, -31.5).join(",")}`} fill="none" stroke="var(--t-climate)" strokeWidth={3} />
            {[0.2, 0.45, 0.7].map((t) => { const p = qb([19.6, -37.6], [17, -35.5], [14.5, -31.5], t); const [x, y] = project(p[0], p[1]); return <path key={t} d={`M${x - 5},${y} L${x + 7},${y - 2} L${x},${y + 7} Z`} fill="var(--t-climate)" />; })}
            <Arrow from={[13.5, -35]} to={[17, -34.3]} colour="var(--t-climate)" />
            <text {...xy(9, -36.3)} fontSize={9} fontWeight={700} style={{ fill: "var(--t-climate)" }}>cold front moving east</text>
          </g>
        )}
        {feature === "tropical-cyclone" && (
          <g>
            {(() => { const [x, y] = project(39.5, -21); return (
              <g>
                <circle cx={x} cy={y} r={18} fill="none" stroke="var(--danger)" strokeWidth={2} strokeDasharray="3 3" />
                <text x={x} y={y + 8} textAnchor="middle" fontSize={22}>🌀</text>
                <text x={x} y={y + 32} textAnchor="middle" fontSize={9} fontWeight={700}>Tropical cyclone</text>
              </g>
            ); })()}
            <Arrow from={[38.4, -21.6]} to={[34.2, -23]} colour="var(--danger)" dashed />
          </g>
        )}
        {feature === "cape-doctor" && <Arrow from={[21.5, -36.2]} to={[18.9, -34.3]} colour="var(--t-climate)" />}
      </SaBaseMap>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface-2 p-3 text-sm">
          <div className="mb-1 text-xs font-bold text-muted uppercase">{summer ? "Summer pattern" : "Winter pattern"}</div>
          {summer ? (
            <p>The sun is overhead in the <strong>Southern Hemisphere</strong>, so the high-pressure belt shifts <strong>south</strong>. The interior heats up and a <strong>heat (thermal) low</strong> forms at the surface. Moist easterly air from the Indian Ocean brings <strong>summer rainfall</strong> to most of the country (thunderstorms). Cold fronts mostly pass <strong>south</strong> of the country.</p>
          ) : (
            <p>The pressure belts shift about 5° <strong>north</strong>. The <strong>Kalahari High</strong> sits over the cold interior: air <strong>sinks</strong>, so skies are clear, days are dry and nights are cold with <strong>frost</strong> and <strong>temperature inversions</strong>. <strong>Cold fronts</strong> bring winter rain to the south-western Cape; berg winds and coastal lows are common.</p>
          )}
        </div>
        <div className="rounded-xl border border-climate/30 bg-climate/5 p-3 text-sm" role="status">
          {f.text ? <Md text={f.text} /> : <p className="text-muted">Pick a weather feature above to see how it forms. Remember: in the Southern Hemisphere air moves <strong>anticlockwise around highs</strong> and <strong>clockwise around lows</strong>.</p>}
        </div>
      </div>
    </WidgetFrame>
  );
}

function xy(lon: number, lat: number) {
  const [x, y] = project(lon, lat);
  return { x, y };
}

function qb(a: [number, number], b: [number, number], c: [number, number], t: number): [number, number] {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
}
