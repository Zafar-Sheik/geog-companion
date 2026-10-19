"use client";
import dynamic from "next/dynamic";
import type { WidgetName } from "@/content/types";

const loading = () => <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-2" />;

/** Widgets are code-split so each lesson only downloads what it uses. */
const REGISTRY: Record<WidgetName, React.ComponentType<Record<string, unknown>>> = {
  sorter: dynamic(() => import("./sorter").then((m) => m.Sorter as never), { loading }),
  "mlc-lifecycle": dynamic(() => import("./mlc-lifecycle").then((m) => m.MlcLifecycle as never), { loading }),
  "front-passage": dynamic(() => import("./front-passage").then((m) => m.FrontPassage as never), { loading }),
  "tropical-cyclone": dynamic(() => import("./tropical-cyclone").then((m) => m.TropicalCyclone as never), { loading }),
  "sa-weather": dynamic(() => import("./sa-weather").then((m) => m.SaWeather as never), { loading }),
  "station-model": dynamic(() => import("./station-model").then((m) => m.StationModel as never), { loading }),
  "valley-climate": dynamic(() => import("./valley-climate").then((m) => m.ValleyClimate as never), { loading }),
  "urban-heat": dynamic(() => import("./urban-heat").then((m) => m.UrbanHeat as never), { loading }),
  "drainage-patterns": dynamic(() => import("./drainage-patterns").then((m) => m.DrainagePatterns as never), { loading }),
  "stream-order": dynamic(() => import("./stream-order").then((m) => m.StreamOrder as never), { loading }),
  "river-profile": dynamic(() => import("./river-profile").then((m) => m.RiverProfile as never), { loading }),
  "river-capture": dynamic(() => import("./river-capture").then((m) => m.RiverCapture as never), { loading }),
  meander: dynamic(() => import("./meander").then((m) => m.Meander as never), { loading }),
  "urban-models": dynamic(() => import("./urban-models").then((m) => m.UrbanModels as never), { loading }),
  "sa-economy": dynamic(() => import("./sa-economy").then((m) => m.SaEconomy as never), { loading }),
  "map-calculator": dynamic(() => import("./map-calculator").then((m) => m.MapCalculator as never), { loading }),
  "cross-section": dynamic(() => import("./cross-section").then((m) => m.CrossSection as never), { loading }),
  "bearing-tool": dynamic(() => import("./bearing-tool").then((m) => m.BearingTool as never), { loading }),
  "gis-layers": dynamic(() => import("./gis-layers").then((m) => m.GisLayers as never), { loading }),
  "raster-vector": dynamic(() => import("./raster-vector").then((m) => m.RasterVector as never), { loading }),
};

export function Widget({ name, props }: { name: WidgetName; props?: Record<string, unknown> }) {
  const C = REGISTRY[name];
  if (!C) return <p className="text-danger">Unknown widget: {name}</p>;
  return <C {...(props ?? {})} />;
}
