"use client";

import { useEffect, useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { type Abi } from "viem";

export interface ReadContractResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook to call a view/pure function on a deployed contract.
 * Re-fetches when contractAddress, functionName, or args change.
 */
export function useReadContract<T>(
  contractAddress: `0x${string}` | undefined,
  abi: Abi,
  functionName: string,
  args: readonly unknown[] = []
): ReadContractResult<T> {
  const publicClient = usePublicClient();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!publicClient || !contractAddress) return;

    async function read() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await publicClient!.readContract({
          address: contractAddress!,
          abi,
          functionName,
          args,
        });
        setData(result as T);
      } catch (e) {
        setError(e instanceof Error ? e.message.split("\n")[0] : "Read failed");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    read();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, contractAddress, functionName, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
