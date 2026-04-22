"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { fetchTxList } from "@/lib/basescan";

export interface TransactionStats {
  txCount: number | null;
  ethBalance: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const TX_MILESTONES = [1, 10, 50, 100, 1000];

export function nextMilestone(count: number): number {
  return TX_MILESTONES.find((m) => m > count) ?? 1000;
}

export function milestoneProgress(count: number): number {
  const prev = [...TX_MILESTONES].reverse().find((m) => m <= count) ?? 0;
  const next = nextMilestone(count);
  if (count >= 1000) return 100;
  return Math.round(((count - prev) / (next - prev)) * 100);
}

export { TX_MILESTONES };

export function useTransactionStats(): TransactionStats {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: balanceData } = useBalance({ address });

  const [txCount, setTxCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";

  useEffect(() => {
    if (!address || !chainId || !publicClient) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (apiKey && address && chainId) {
          const txs = await fetchTxList(address, chainId, apiKey);
          // Count only outgoing successful transactions
          const sent = txs.filter(
            (tx) =>
              tx.from?.toLowerCase() === address.toLowerCase() &&
              tx.isError === "0"
          );
          setTxCount(sent.length);
        } else if (publicClient && address) {
          // Fallback: nonce = number of txs sent
          const nonce = await publicClient.getTransactionCount({ address });
          setTxCount(nonce);
        }
      } catch (e) {
        // Fallback to nonce on API error
        try {
          if (publicClient && address) {
            const nonce = await publicClient.getTransactionCount({ address });
            setTxCount(nonce);
          }
        } catch {
          setError("Failed to fetch transaction count");
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [address, chainId, apiKey, tick]);

  const ethBalance = balanceData
    ? parseFloat(balanceData.formatted).toFixed(4)
    : null;

  return {
    txCount,
    ethBalance,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
