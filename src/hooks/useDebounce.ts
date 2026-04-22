"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value` that only updates
 * after `delayMs` milliseconds of no changes.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}
