"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchTxList, TxRecord } from "@/lib/basescan";

export interface TxHistoryResult {
  txs: TxRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTxHistory(limit = 10): TxHistoryResult {
  const { address, chainId } = useAccount();
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";

  useEffect(() => {
    if (!address || !chainId || !apiKey) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (address && chainId) {
          const all = await fetchTxList(address, chainId, apiKey);
          // Most recent first, only outgoing
          const sent = all
            .filter((tx) => tx.from?.toLowerCase() === address.toLowerCase())
            .reverse()
            .slice(0, limit);
          setTxs(sent);
        }
      } catch {
        setError("Failed to load transaction history");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [address, chainId, apiKey, limit, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { txs, isLoading, error, refetch };
}
