/**
 * Content model for lessons. Lessons are plain TypeScript data so that they
 * are type-checked and can be tested automatically (every quiz answer, every
 * sorter item and every exam memo is validated by the test-suite).
 */

/** NSC Grade 12 Geography is written as two 3-hour, 150-mark papers. */
export type Paper = 1 | 2;

export type Topic = "Climate & Weather" | "Geomorphology" | "Settlement" | "Economic Geography" | "Mapwork & GIS";

export type CalloutVariant = "key" | "tip" | "mistake" | "memory" | "exam" | "break" | "real-world";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Term {
  term: string;
  def: string;
}

export type Block =
  | { type: "text"; md: string }
  | { type: "callout"; variant: CalloutVariant; title?: string; md: string }
  | { type: "keypoints"; points: string[] }
  | { type: "flashcards"; cards: { front: string; back: string }[] }
  /** Renders the lesson's own key terms as flashcards. */
  | { type: "terms" }
  | { type: "quiz"; id: string; questions: QuizQuestion[] }
  | { type: "widget"; widget: WidgetName; props?: Record<string, unknown> }
  /** Put the steps of a process in order (stages of a cyclone, river capture…). */
  | { type: "sequence"; id: string; title: string; steps: string[]; explain: string }
  /** Match each term to its description. */
  | { type: "match"; id: string; title: string; pairs: { left: string; right: string }[] }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  /** A short exam-style question with a memo the learner self-marks against. */
  | { type: "exam"; question: ExamPart & { id: string } };

export type WidgetName =
  | "sorter"
  | "mlc-lifecycle"
  | "front-passage"
  | "tropical-cyclone"
  | "sa-weather"
  | "station-model"
  | "valley-climate"
  | "urban-heat"
  | "drainage-patterns"
  | "stream-order"
  | "river-profile"
  | "river-capture"
  | "meander"
  | "urban-models"
  | "sa-economy"
  | "map-calculator"
  | "cross-section"
  | "bearing-tool"
  | "gis-layers"
  | "raster-vector";

export interface Chunk {
  id: string;
  title: string;
  /** Rough reading/doing time in minutes – chunks are kept short (2–8 min). */
  minutes: number;
  blocks: Block[];
}

export interface Lesson {
  slug: string;
  /** Mapwork & GIS is examined in Section B of BOTH papers. */
  paper: Paper | "both";
  topic: Topic;
  order: number;
  title: string;
  tagline: string;
  emoji: string;
  /** CAPS / exam-guideline reference. */
  caps: string;
  objectives: string[];
  /** Learning style tags used in docs: visual, auditory, read-write, kinaesthetic */
  styles: ("visual" | "auditory" | "read-write" | "kinaesthetic")[];
  xp: number;
  /** Key concepts – feed the lesson flashcards, the global deck and the games. */
  terms: Term[];
  chunks: Chunk[];
}

/** Cognitive levels used in the DBE examination guidelines. */
export type CognitiveLevel = "knowledge" | "comprehension" | "application" | "higher-order";

export interface ExamPart {
  q: string;
  marks: number;
  /** Each memo point is worth one mark unless the question says otherwise. */
  memo: string[];
  level?: CognitiveLevel;
}

export interface ExamQuestion {
  id: string;
  paper: Paper | "both";
  topic: Topic;
  title: string;
  /** Stimulus: a case study, extract or data that the questions refer to. */
  source?: string;
  /** Optional interactive figure shown with the source. */
  figure?: { widget: WidgetName; props?: Record<string, unknown> };
  parts: ExamPart[];
}
