"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { useReadContract } from "@/hooks/useReadContract";
import { useDebounce } from "@/hooks/useDebounce";
import { COUNTER_ABI } from "@/lib/contracts";

export function CounterReader() {
  const { address } = useAccount();
  const [contractAddr, setContractAddr] = useState("");
  const debouncedAddr = useDebounce(contractAddr, 400);

  const validAddr = isAddress(debouncedAddr)
    ? (debouncedAddr as `0x${string}`)
    : undefined;

  const { data: count, isLoading, error, refetch } = useReadContract<bigint>(
    validAddr,
    COUNTER_ABI as never,
    "count"
  );

  if (!address) return null;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-sm">Read Counter Value</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Paste a Counter address to read its <code className="text-gray-400">count</code>
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="0x..."
          value={contractAddr}
          onChange={(e) => setContractAddr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && validAddr && refetch()}
          className="flex-1 bg-[#333] border border-[#555] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500 transition"
          aria-label="Counter contract address for reading"
        />
        <button
          onClick={refetch}
          disabled={!validAddr || isLoading}
          className="bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-lg px-3 py-2 text-sm transition disabled:opacity-40"
          aria-label="Read counter value"
        >
          {isLoading ? "…" : "Read"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {count !== null && !error && (
        <div className="bg-[#1a1a1a] rounded-lg p-3">
          <p className="text-xs text-gray-400">Current count</p>
          <p className="text-3xl font-bold tabular-nums text-purple-300 mt-1">
            {count.toString()}
          </p>
        </div>
      )}
    </div>
  );
}
