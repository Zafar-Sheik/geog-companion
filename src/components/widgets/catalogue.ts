import type { Topic, WidgetName } from "@/content/types";

/** Every interactive tool, used by the Toolkit page and the docs. */
export const WIDGET_CATALOGUE: { name: WidgetName; title: string; topic: Topic; description: string; props?: Record<string, unknown> }[] = [
  { name: "mlc-lifecycle", title: "Mid-latitude cyclone life cycle", topic: "Climate & Weather", description: "Five stages, fronts and Southern vs Northern Hemisphere." },
  { name: "front-passage", title: "Cold front passing Cape Town", topic: "Climate & Weather", description: "Watch temperature, pressure, wind and cloud change." },
  { name: "tropical-cyclone", title: "Tropical cyclone lab", topic: "Climate & Weather", description: "Anatomy, life cycle, conditions and the danger quadrant." },
  { name: "sa-weather", title: "SA weather systems", topic: "Climate & Weather", description: "Highs, berg winds, coastal lows, moisture front – summer vs winter." },
  { name: "station-model", title: "Station model builder", topic: "Climate & Weather", description: "Build and read synoptic station models." },
  { name: "valley-climate", title: "Valley climates", topic: "Climate & Weather", description: "Anabatic/katabatic winds, inversions, frost pockets, thermal belts." },
  { name: "urban-heat", title: "Urban heat island", topic: "Climate & Weather", description: "Change the city and see the heat island grow or shrink." },
  { name: "drainage-patterns", title: "Drainage pattern detective", topic: "Geomorphology", description: "Eight patterns and the rock structures behind them." },
  { name: "stream-order", title: "Stream ordering", topic: "Geomorphology", description: "Order a river network using Strahler's rules." },
  { name: "river-profile", title: "River profiles & rejuvenation", topic: "Geomorphology", description: "Upper, middle, lower course; base level, knickpoints, dams." },
  { name: "meander", title: "Meanders & oxbow lakes", topic: "Geomorphology", description: "From a bend to an oxbow lake, step by step." },
  { name: "river-capture", title: "River capture", topic: "Geomorphology", description: "Captor, captured, elbow of capture, wind gap, misfit stream." },
  { name: "urban-models", title: "Urban land-use models", topic: "Settlement", description: "Burgess, Hoyt, Harris & Ullman, apartheid and post-apartheid city." },
  {
    name: "sorter", title: "Push vs pull factors", topic: "Settlement", description: "Sort reasons for rural–urban migration.",
    props: {
      id: "toolkit-push-pull", title: "Push vs pull factors", buckets: ["Push factor (rural)", "Pull factor (urban)"], colour: "var(--t-settlement)",
      items: [
        { text: "Drought and crop failure", bucket: "Push factor (rural)" }, { text: "Job opportunities", bucket: "Pull factor (urban)" },
        { text: "Few schools and clinics", bucket: "Push factor (rural)" }, { text: "Better health care", bucket: "Pull factor (urban)" },
        { text: "Lack of land to farm", bucket: "Push factor (rural)" }, { text: "Entertainment and bright lights", bucket: "Pull factor (urban)" },
        { text: "Low wages on farms", bucket: "Push factor (rural)" }, { text: "Better schools and universities", bucket: "Pull factor (urban)" },
      ],
    },
  },
  { name: "sa-economy", title: "SA economic map", topic: "Economic Geography", description: "Industrial regions, SEZs, mining and farming areas." },
  { name: "map-calculator", title: "Map calculations", topic: "Mapwork & GIS", description: "Distance, area, gradient, magnetic declination, VE, speed – with memo working." },
  { name: "cross-section", title: "Contours → cross-section", topic: "Mapwork & GIS", description: "Landforms from contours, profiles and intervisibility." },
  { name: "bearing-tool", title: "True bearing protractor", topic: "Mapwork & GIS", description: "Measure and estimate true bearings and back bearings." },
  { name: "gis-layers", title: "GIS layer lab", topic: "Mapwork & GIS", description: "Layers, buffering, attribute queries and overlay." },
  { name: "raster-vector", title: "Raster vs vector", topic: "Mapwork & GIS", description: "Data structures and spatial resolution." },
];

export const WIDGET_COUNT = WIDGET_CATALOGUE.length;
