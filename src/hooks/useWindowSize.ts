"use client";

import { useEffect, useState } from "react";

export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Returns the current window dimensions.
 * Returns undefined during SSR (before hydration).
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : undefined,
    height: typeof window !== "undefined" ? window.innerHeight : undefined,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // set initial value
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
