"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function NetworkBanner() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="text-center text-sm py-2 px-4 bg-orange-950 text-orange-300">
        ⚠ No internet connection — on-chain data may be stale
      </div>
    );
  }

  if (!isConnected) return null;

  const isBase = chainId === base.id;
  const isBaseSepolia = chainId === baseSepolia.id;
  const isSupported = isBase || isBaseSepolia;

  if (isSupported) {
    return (
      <div
        className={`text-center text-sm py-2 px-4 ${
          isBase
            ? "bg-blue-950 text-blue-300"
            : "bg-yellow-950 text-yellow-300"
        }`}
      >
        {isBase ? "Base Mainnet" : "Base Sepolia Testnet"} —{" "}
        {isBase ? (
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="underline hover:no-underline"
          >
            switch to Sepolia (testnet)
          </button>
        ) : (
          <button
            onClick={() => switchChain({ chainId: base.id })}
            className="underline hover:no-underline"
          >
            switch to Base Mainnet
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center text-sm py-2 px-4 bg-red-950 text-red-300">
      Unsupported network. Switch to{" "}
      <button
        onClick={() => switchChain({ chainId: base.id })}
        className="underline hover:no-underline"
      >
        Base Mainnet
      </button>{" "}
      or{" "}
      <button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        className="underline hover:no-underline"
      >
        Base Sepolia
      </button>
    </div>
  );
}
