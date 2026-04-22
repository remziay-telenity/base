"use client";

import { useTransactionStats, TX_MILESTONES } from "@/hooks/useTransactionStats";
import { TxProgressBar } from "./TxProgressBar";
import { Skeleton } from "./LoadingSkeleton";

export function OnchainStats() {
  const { txCount, ethBalance, isLoading, error, refetch } = useTransactionStats();

  const hasEnoughEth = ethBalance !== null && parseFloat(ethBalance) >= 0.001;
  const onchainRoleMet = hasEnoughEth && txCount !== null && txCount >= 1;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Your Onchain Stats</h2>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="text-xs text-gray-500 hover:text-gray-300 transition disabled:opacity-40"
        >
          {isLoading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-950/40 border border-red-900 rounded-xl px-4 py-3">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={refetch}
            className="text-xs text-red-400 hover:text-red-300 underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* ETH Balance */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
        <div>
          <p className="text-xs text-gray-400">ETH Balance</p>
          {isLoading ? (
            <Skeleton className="h-6 w-32 mt-1" />
          ) : (
            <p className="text-lg font-bold">
              {ethBalance !== null ? `${ethBalance} ETH` : "—"}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Need ≥0.001 ETH for Onchain role</p>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${
            isLoading
              ? "bg-[#222] text-transparent"
              : hasEnoughEth
              ? "bg-green-900 text-green-400"
              : "bg-[#222] text-gray-500"
          }`}
        >
          {!isLoading && (hasEnoughEth ? "✓" : "✗")}
        </div>
      </div>

      {/* Tx count */}
      <div className="p-3 bg-[#1a1a1a] rounded-xl space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Transactions Sent</p>
          {onchainRoleMet && (
            <span className="text-xs text-green-400 font-medium">Onchain role ✓</span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-24 mt-1" />
        ) : (
          <p className="text-3xl font-bold tabular-nums">
            {txCount !== null ? txCount.toLocaleString() : "—"}
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Milestones</p>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))
          : txCount !== null &&
            TX_MILESTONES.map((milestone, i) => (
              <TxProgressBar
                key={milestone}
                count={txCount}
                milestone={milestone}
                prevMilestone={i === 0 ? 0 : TX_MILESTONES[i - 1]}
              />
            ))}
      </div>
    </div>
  );
}
