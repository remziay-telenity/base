"use client";

import { useMemo } from "react";
import { useTransactionStats } from "./useTransactionStats";

export const ACTIVE_THRESHOLDS = [1, 10, 50, 100] as const;

export type ActiveTier = {
  label: string;
  minTxs: number;
  achieved: boolean;
};

/**
 * Classifies a wallet's activity level on Base based on outgoing tx count.
 * Returns tier info and the raw tx count.
 */
export function useActiveOnBase() {
  const { txCount, isLoading, error, refetch } = useTransactionStats();

  const tiers: ActiveTier[] = useMemo(
    () => [
      { label: "Newcomer",   minTxs: 1,   achieved: (txCount ?? 0) >= 1 },
      { label: "Regular",    minTxs: 10,  achieved: (txCount ?? 0) >= 10 },
      { label: "Active",     minTxs: 50,  achieved: (txCount ?? 0) >= 50 },
      { label: "Power User", minTxs: 100, achieved: (txCount ?? 0) >= 100 },
    ],
    [txCount]
  );

  const currentTier = useMemo(
    () => [...tiers].reverse().find((t) => t.achieved) ?? null,
    [tiers]
  );

  return { tiers, currentTier, txCount, isLoading, error, refetch };
}
