"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { namehash } from "viem";
import { base } from "wagmi/chains";

// Base L2 Reverse Resolver
const L2_RESOLVER_ADDRESS = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as const;
const RESOLVER_ABI = [
  {
    name: "name",
    type: "function" as const,
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view" as const,
  },
] as const;

export interface BasenameResult {
  basename: string | null;
  isLoading: boolean;
  hasBasename: boolean;
}

export function useBasename(): BasenameResult {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const [basename, setBasename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || !publicClient || chainId !== base.id) {
      setBasename(null);
      return;
    }

    async function resolve() {
      setIsLoading(true);
      try {
        const reverseNode = namehash(
          `${address!.slice(2).toLowerCase()}.addr.reverse`
        );
        const result = await publicClient!.readContract({
          address: L2_RESOLVER_ADDRESS,
          abi: RESOLVER_ABI,
          functionName: "name",
          args: [reverseNode],
        });
        setBasename(result && result.length > 0 ? result : null);
      } catch {
        setBasename(null);
      } finally {
        setIsLoading(false);
      }
    }

    resolve();
  }, [address, chainId, publicClient]);

  return { basename, isLoading, hasBasename: basename !== null };
}
