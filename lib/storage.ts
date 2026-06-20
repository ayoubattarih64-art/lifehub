"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Local-storage first persistence helpers.
 * All app data is stored under namespaced keys so modules never collide.
 */

const PREFIX = "lifehub:";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota / serialization errors */
  }
}

/**
 * useLocalStorage — a small typed wrapper around localStorage.
 * Hydration-safe: starts with the fallback on the server and reads
 * the persisted value after mount.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);

  // Read the persisted value once per key, after mount, without calling
  // setState synchronously inside the effect body.
  useEffect(() => {
    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;
    const stored = readStorage<T>(key, fallback);
    queueMicrotask(() => {
      setValue(stored);
      setHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
