"use client";

import { useAccount, useBalance } from "wagmi";
import { useEthPrice } from "@/hooks/useEthPrice";

const HOLDING_MILESTONES = [1, 100, 1000];

export function HoldingTracker() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { price, isLoading: priceLoading } = useEthPrice();

  const ethAmount = balance ? parseFloat(balance.formatted) : null;
  const usdValue =
    ethAmount !== null && price !== null ? ethAmount * price : null;

  const isLoading = priceLoading || balance === undefined;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
          $
        </div>
        <div>
          <h3 className="font-semibold text-sm">Asset Holdings</h3>
          <p className="text-xs text-gray-400">
            Unlocks: Holding $1 / $100 / $1,000 roles
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3">
        <div>
          <p className="text-xs text-gray-400">ETH Balance</p>
          <p className="text-lg font-bold">
            {isLoading ? "…" : ethAmount !== null ? `${ethAmount.toFixed(4)} ETH` : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">≈ USD</p>
          <p className="text-lg font-bold text-emerald-400">
            {isLoading
              ? "…"
              : usdValue !== null
              ? `$${usdValue.toFixed(2)}`
              : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Milestones</p>
        {HOLDING_MILESTONES.map((target) => {
          const met = usdValue !== null && usdValue >= target;
          return (
            <div key={target} className="flex items-center justify-between text-sm">
              <span className={met ? "text-green-400" : "text-gray-400"}>
                {met ? "✓ " : ""}Hold ${target.toLocaleString()}+
              </span>
              <span className={met ? "text-green-400 font-medium" : "text-gray-600"}>
                {isLoading ? "…" : met ? "complete" : usdValue !== null ? `$${usdValue.toFixed(2)}/$${target}` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {price && (
        <p className="text-xs text-gray-600">
          ETH price: ${price.toLocaleString()} · via CoinGecko
        </p>
      )}
    </div>
  );
}
