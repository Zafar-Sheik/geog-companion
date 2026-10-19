"use client";
import { createPersistedStore, useStore } from "./store";
import { todayKey } from "./utils";

export interface Progress {
  xp: number;
  completedLessons: Record<string, { at: number; quizScore?: number }>;
  /** lesson slug -> chunk ids that have been read */
  chunks: Record<string, string[]>;
  quizzes: Record<string, { correct: number; total: number }>;
  /** exam question id -> best self-marked score */
  exams: Record<string, { score: number; total: number; at: number }>;
  /** sequence / match / sorter puzzles solved */
  puzzles: Record<string, number>;
  badges: string[];
  /** yyyy-mm-dd -> xp earned that day */
  activity: Record<string, number>;
  stats: { cardsReviewed: number; arenaRounds: number; games: number; calculations: number; focusSessions: number; toolsUsed: number };
}

export const EMPTY_PROGRESS: Progress = {
  xp: 0,
  completedLessons: {},
  chunks: {},
  quizzes: {},
  exams: {},
  puzzles: {},
  badges: [],
  activity: {},
  stats: { cardsReviewed: 0, arenaRounds: 0, games: 0, calculations: 0, focusSessions: 0, toolsUsed: 0 },
};

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first-lesson", name: "First Footsteps", description: "Completed your first lesson.", emoji: "🥾" },
  { id: "storm-chaser", name: "Storm Chaser", description: "Completed every Climate & Weather lesson.", emoji: "🌀" },
  { id: "river-runner", name: "River Runner", description: "Completed every Geomorphology lesson.", emoji: "🏞️" },
  { id: "town-planner", name: "Town Planner", description: "Completed every Settlement lesson.", emoji: "🏘️" },
  { id: "economist", name: "Mzansi Economist", description: "Completed every Economic Geography lesson.", emoji: "🏭" },
  { id: "cartographer", name: "Cartographer", description: "Completed every Mapwork & GIS lesson.", emoji: "🗺️" },
  { id: "matric-ready", name: "Matric Ready", description: "Completed every lesson in the course.", emoji: "🎓" },
  { id: "card-shark", name: "Card Shark", description: "Reviewed 100 flashcards.", emoji: "🃏" },
  { id: "arena", name: "Arena Champion", description: "Finished 5 Quiz Arena rounds.", emoji: "🏟️" },
  { id: "examiner", name: "Exam Ready", description: "Self-marked 5 exam-style questions.", emoji: "📝" },
  { id: "calculator", name: "Map Maths Pro", description: "Got 10 map calculations right.", emoji: "📐" },
  { id: "gamer", name: "Game On", description: "Played 5 revision games.", emoji: "🎮" },
  { id: "streak-3", name: "On a Roll", description: "Learned on 3 days in a row.", emoji: "🔥" },
  { id: "streak-7", name: "Unstoppable", description: "Learned on 7 days in a row.", emoji: "⚡" },
  { id: "focus", name: "Deep Focus", description: "Finished 3 focus-timer sessions.", emoji: "🎧" },
  { id: "perfect-quiz", name: "Sharp Shooter", description: "Got 100% on a quiz.", emoji: "🎯" },
];

/** Badge id awarded for finishing every lesson of a topic. */
export const TOPIC_BADGES: Record<string, string> = {
  "Climate & Weather": "storm-chaser",
  Geomorphology: "river-runner",
  Settlement: "town-planner",
  "Economic Geography": "economist",
  "Mapwork & GIS": "cartographer",
};

export const progressStore = createPersistedStore<Progress>("geomzansi:progress", EMPTY_PROGRESS);
export const useProgress = () => useStore(progressStore);

type Listener = (e: { type: "xp"; amount: number; reason: string } | { type: "badge"; badge: BadgeDef }) => void;
const rewardListeners = new Set<Listener>();
export function onReward(l: Listener) {
  rewardListeners.add(l);
  return () => {
    rewardListeners.delete(l);
  };
}

export function levelFor(xp: number) {
  // Each level needs a little more XP than the last: 100, 250, 450, 700 ...
  let level = 1;
  let need = 100;
  let floor = 0;
  while (xp >= floor + need) {
    floor += need;
    level++;
    need += 50;
  }
  return { level, into: xp - floor, need };
}

export function streak(activity: Record<string, number>): number {
  let count = 0;
  const d = new Date();
  if (!activity[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (activity[todayKey(d)]) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function award(p: Progress, id: string): Progress {
  if (p.badges.includes(id)) return p;
  const badge = BADGES.find((b) => b.id === id);
  if (badge) setTimeout(() => rewardListeners.forEach((l) => l({ type: "badge", badge })), 0);
  return { ...p, badges: [...p.badges, id] };
}

function checkBadges(p: Progress, topicLessons?: Record<string, string[]>): Progress {
  let next = p;
  const stats = { ...EMPTY_PROGRESS.stats, ...next.stats };
  if (Object.keys(next.completedLessons).length >= 1) next = award(next, "first-lesson");
  if (stats.cardsReviewed >= 100) next = award(next, "card-shark");
  if (stats.arenaRounds >= 5) next = award(next, "arena");
  if (Object.keys(next.exams ?? {}).length >= 5) next = award(next, "examiner");
  if (stats.calculations >= 10) next = award(next, "calculator");
  if (stats.games >= 5) next = award(next, "gamer");
  if (stats.focusSessions >= 3) next = award(next, "focus");
  const s = streak(next.activity);
  if (s >= 3) next = award(next, "streak-3");
  if (s >= 7) next = award(next, "streak-7");
  if (Object.values(next.quizzes).some((q) => q.total > 0 && q.correct === q.total)) next = award(next, "perfect-quiz");
  if (topicLessons) {
    let all = true;
    for (const [topic, slugs] of Object.entries(topicLessons)) {
      const done = slugs.length > 0 && slugs.every((s2) => next.completedLessons[s2]);
      if (done && TOPIC_BADGES[topic]) next = award(next, TOPIC_BADGES[topic]);
      all = all && done;
    }
    if (all && Object.keys(topicLessons).length) next = award(next, "matric-ready");
  }
  return next;
}

let topicIndex: Record<string, string[]> | undefined;
export function registerTopicIndex(idx: Record<string, string[]>) {
  topicIndex = idx;
}

function mutate(fn: (p: Progress) => Progress) {
  progressStore.set((p) => checkBadges(fn({ ...EMPTY_PROGRESS, ...p, stats: { ...EMPTY_PROGRESS.stats, ...p.stats } }), topicIndex));
}

export function addXp(amount: number, reason: string) {
  if (amount <= 0) return;
  mutate((p) => {
    const day = todayKey();
    return { ...p, xp: p.xp + amount, activity: { ...p.activity, [day]: (p.activity[day] ?? 0) + amount } };
  });
  rewardListeners.forEach((l) => l({ type: "xp", amount, reason }));
}

export function markChunk(lesson: string, chunk: string) {
  const p = progressStore.get();
  if (p.chunks[lesson]?.includes(chunk)) return;
  mutate((s) => ({ ...s, chunks: { ...s.chunks, [lesson]: [...(s.chunks[lesson] ?? []), chunk] } }));
  addXp(5, "Section read");
}

export function completeLesson(lesson: string, xp: number) {
  const p = progressStore.get();
  if (p.completedLessons[lesson]) return false;
  mutate((s) => ({ ...s, completedLessons: { ...s.completedLessons, [lesson]: { at: Date.now() } } }));
  addXp(xp, "Lesson complete");
  return true;
}

export function recordQuiz(id: string, correct: number, total: number) {
  const prev = progressStore.get().quizzes[id];
  mutate((s) => ({ ...s, quizzes: { ...s.quizzes, [id]: { correct: Math.max(correct, prev?.correct ?? 0), total } } }));
  if (!prev) addXp(correct * 10, "Quiz");
}

export function recordExam(id: string, score: number, total: number) {
  const prev = progressStore.get().exams?.[id];
  mutate((s) => ({ ...s, exams: { ...s.exams, [id]: { score: Math.max(score, prev?.score ?? 0), total, at: Date.now() } } }));
  if (!prev) addXp(10 + score * 2, "Exam question marked");
}

/** Sequence, match and sorter puzzles: XP the first time only. */
export function solvePuzzle(id: string, xp = 15) {
  const prev = progressStore.get().puzzles?.[id];
  mutate((s) => ({ ...s, puzzles: { ...s.puzzles, [id]: (prev ?? 0) + 1 } }));
  if (!prev) addXp(xp, "Puzzle solved");
}

export function bumpStat(stat: keyof Progress["stats"], by = 1) {
  mutate((s) => ({ ...s, stats: { ...s.stats, [stat]: (s.stats[stat] ?? 0) + by } }));
}
