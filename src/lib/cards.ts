"use client";
import { createPersistedStore, useStore } from "./store";
import { todayKey } from "./utils";

/**
 * Leitner-box spaced repetition. A card you know moves up a box and comes back
 * later; a card you miss drops to box 1 and comes back tomorrow.
 */
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = 5;

export interface CardState {
  box: number;
  /** yyyy-mm-dd when the card is next due */
  due: string;
  seen: number;
  lapses: number;
}

export const cardStore = createPersistedStore<{ cards: Record<string, CardState> }>("geomzansi:cards", { cards: {} });
export const useCards = () => useStore(cardStore);

export function cardId(topic: string, term: string) {
  return `${topic}::${term}`.toLowerCase();
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

export function isDue(state: CardState | undefined, today = todayKey()) {
  return !state || state.due <= today;
}

export function reviewCard(id: string, knewIt: boolean) {
  cardStore.set((s) => {
    const prev = s.cards[id] ?? { box: 0, due: todayKey(), seen: 0, lapses: 0 };
    const box = knewIt ? Math.min(MAX_BOX, prev.box + 1) : 1;
    return {
      cards: {
        ...s.cards,
        [id]: { box, due: addDays(BOX_INTERVAL_DAYS[box]), seen: prev.seen + 1, lapses: prev.lapses + (knewIt ? 0 : 1) },
      },
    };
  });
}
