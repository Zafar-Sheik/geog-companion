import type { Paper, Topic } from "@/content/types";

/** Every topic has ONE colour across the whole site (see docs/06-design-system.md). */
export const TOPICS: { topic: Topic; paper: Paper | "both"; colour: string; emoji: string; slug: string; blurb: string; marks: string }[] = [
  { topic: "Climate & Weather", paper: 1, colour: "var(--t-climate)", emoji: "🌀", slug: "climate", marks: "60 marks", blurb: "Mid-latitude and tropical cyclones, SA weather systems, valley and urban climates, synoptic maps." },
  { topic: "Geomorphology", paper: 1, colour: "var(--t-geomorph)", emoji: "🏞️", slug: "geomorphology", marks: "60 marks", blurb: "Drainage basins, drainage patterns, stream order, fluvial landforms, river profiles, capture and catchment management." },
  { topic: "Settlement", paper: 2, colour: "var(--t-settlement)", emoji: "🏘️", slug: "settlement", marks: "60 marks", blurb: "Rural and urban settlements, urbanisation, urban hierarchies, land-use models and urban issues." },
  { topic: "Economic Geography", paper: 2, colour: "var(--t-economic)", emoji: "🏭", slug: "economic", marks: "60 marks", blurb: "Structure of SA's economy, agriculture, mining, industrial regions, SDIs & SEZs, the informal sector." },
  { topic: "Mapwork & GIS", paper: "both", colour: "var(--t-mapwork)", emoji: "🗺️", slug: "mapwork", marks: "30 marks per paper", blurb: "Map calculations, topographic map and orthophoto interpretation, cross-sections and GIS – examined in BOTH papers." },
];

export function topicMeta(t: Topic) {
  return TOPICS.find((x) => x.topic === t)!;
}

export const PAPER_INFO: Record<1 | 2, { title: string; duration: string; marks: number; sections: { name: string; marks: number }[] }> = {
  1: {
    title: "Paper 1 – Physical Geography",
    duration: "3 hours",
    marks: 150,
    sections: [
      { name: "Q1 Climate & Weather", marks: 60 },
      { name: "Q2 Geomorphology", marks: 60 },
      { name: "Q3 Geographical Skills & Techniques (mapwork & GIS)", marks: 30 },
    ],
  },
  2: {
    title: "Paper 2 – Human Geography",
    duration: "3 hours",
    marks: 150,
    sections: [
      { name: "Q1 Rural & Urban Settlement", marks: 60 },
      { name: "Q2 Economic Geography of South Africa", marks: 60 },
      { name: "Q3 Geographical Skills & Techniques (mapwork & GIS)", marks: 30 },
    ],
  },
};

export function paperLabel(p: Paper | "both") {
  return p === "both" ? "Paper 1 & 2" : `Paper ${p}`;
}
