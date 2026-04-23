"use client";

import { useAccount } from "wagmi";
import { useTxHistory } from "@/hooks/useTxHistory";
import { txUrl } from "@/lib/explorer";
import { shortHash, timeAgo } from "@/lib/format";
import { Skeleton } from "./LoadingSkeleton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface TxRowProps {
  tx: { hash: string; timeStamp: string; isError: string };
  chainId: number | undefined;
}

function TxRow({ tx, chainId }: TxRowProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="flex items-center justify-between py-2 gap-2">
      <div className="flex items-center gap-1 min-w-0">
        <a
          href={txUrl(chainId, tx.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-blue-400 hover:underline truncate"
          aria-label={`View transaction ${tx.hash} on Basescan`}
        >
          {shortHash(tx.hash)}
        </a>
        <button
          onClick={() => copy(tx.hash)}
          className="shrink-0 text-xs text-gray-600 hover:text-gray-300 transition"
          aria-label="Copy transaction hash"
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
        tx.isError === "0"
          ? "bg-green-950 text-green-400"
          : "bg-red-950 text-red-400"
      }`}>
        {tx.isError === "0" ? "success" : "failed"}
      </span>
      <span className="text-xs text-gray-500 tabular-nums shrink-0">
        {timeAgo(tx.timeStamp)}
      </span>
    </div>
  );
}

export function TxHistory() {
  const { chainId } = useAccount();
  const { txs, isLoading, error, refetch } = useTxHistory(10);
  const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";

  if (!apiKey) {
    return null;
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent Transactions</h3>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="text-xs text-gray-500 hover:text-gray-300 transition disabled:opacity-40"
          aria-label="Refresh transaction history"
        >
          {isLoading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : txs.length === 0 ? (
        <p className="text-xs text-gray-500">No transactions found yet.</p>
      ) : (
        <div className="divide-y divide-[#1e1e1e]">
          {txs.map((tx) => (
            <TxRow key={tx.hash} tx={tx} chainId={chainId} />
          ))}
        </div>
      )}
    </div>
  );
}
