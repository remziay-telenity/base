"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchDeployedContracts, TxRecord } from "@/lib/basescan";

export const CONTRACT_MILESTONES = [1, 5, 10];

export interface DeployedContractsStats {
  contracts: TxRecord[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeployedContracts(): DeployedContractsStats {
  const { address, chainId } = useAccount();
  const [contracts, setContracts] = useState<TxRecord[]>([]);
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
          const deployed = await fetchDeployedContracts(address, chainId, apiKey);
          setContracts(deployed);
        }
      } catch (e) {
        setError("Failed to fetch deployed contracts — check Basescan API key");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [address, chainId, apiKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { contracts, count: contracts.length, isLoading, error, refetch };
}
