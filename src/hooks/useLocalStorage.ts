"use client";

import { useState, useCallback } from "react";

/**
 * Persists state to localStorage under `key`.
 * Falls back to `initialValue` when localStorage is unavailable
 * (SSR, private browsing, or quota exceeded).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
          }
          return next;
        });
      } catch {
        // Silently ignore quota or security errors
      }
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch {
      // Silently ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, remove] as const;
}
