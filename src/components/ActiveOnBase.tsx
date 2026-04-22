"use client";

import { useActiveOnBase } from "@/hooks/useActiveOnBase";

export function ActiveOnBase() {
  const { tiers, currentTier, txCount, isLoading, error, refetch } = useActiveOnBase();

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Active on Base</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Unlock roles by reaching transaction milestones
          </p>
        </div>
        {currentTier && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400">
            {currentTier.label}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={refetch}
            className="text-xs text-gray-500 hover:text-gray-300 transition underline"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {tiers.map((t) => (
            <div key={t.minTxs} className="h-7 bg-[#1a1a1a] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tiers.map((t) => (
            <div
              key={t.minTxs}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                t.achieved
                  ? "bg-blue-950/50 border border-blue-800"
                  : "bg-[#1a1a1a] border border-[#2a2a2a]"
              }`}
            >
              <span className={t.achieved ? "text-blue-300 font-medium" : "text-gray-400"}>
                {t.achieved ? "✓ " : ""}{t.label}
              </span>
              <span className={t.achieved ? "text-blue-400 text-xs" : "text-gray-600 text-xs"}>
                {t.achieved
                  ? "complete"
                  : `${txCount ?? 0} / ${t.minTxs} txs`}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && txCount !== null && (
        <p className="text-xs text-gray-600 text-right tabular-nums">
          {txCount} outgoing transaction{txCount !== 1 ? "s" : ""} on Base
        </p>
      )}
    </div>
  );
}
