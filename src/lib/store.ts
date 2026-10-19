"use client";
import { useSyncExternalStore } from "react";

/**
 * Tiny persisted store (localStorage) – no server, no accounts, POPIA-friendly:
 * a learner's data never leaves their device.
 */
export function createPersistedStore<T extends object>(key: string, initial: T) {
  let state: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {
      /* ignore corrupted storage */
    }
  };

  const store = {
    get(): T {
      load();
      return state;
    },
    getServer(): T {
      return initial;
    },
    set(update: Partial<T> | ((s: T) => Partial<T>)) {
      load();
      const patch = typeof update === "function" ? update(state) : update;
      state = { ...state, ...patch };
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage full or blocked */
      }
      listeners.forEach((l) => l());
    },
    reset() {
      state = initial;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          loaded = false;
          load();
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
  return store;
}

export function useStore<T extends object>(store: ReturnType<typeof createPersistedStore<T>>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
