"use client";

import { useEffect, useState } from "react";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedPrice: number | null = null;
let cacheTime = 0;

export function useEthPrice(): { price: number | null; isLoading: boolean } {
  const [price, setPrice] = useState<number | null>(cachedPrice);
  const [isLoading, setIsLoading] = useState(!cachedPrice);

  useEffect(() => {
    const now = Date.now();
    if (cachedPrice && now - cacheTime < CACHE_TTL_MS) {
      setPrice(cachedPrice);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(COINGECKO_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const p = data?.ethereum?.usd as number;
        cachedPrice = p;
        cacheTime = Date.now();
        setPrice(p);
      })
      .catch(() => {
        if (!cancelled) setPrice(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { price, isLoading };
}
