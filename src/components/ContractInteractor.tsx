"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { txUrl } from "@/lib/explorer";
import { COUNTER_ABI } from "@/lib/contracts";
import toast from "react-hot-toast";

export function ContractInteractor() {
  const { address, chainId } = useAccount();
  const [contractAddr, setContractAddr] = useState("");
  const [addrError, setAddrError] = useState("");

  const validAddr =
    isAddress(contractAddr) ? (contractAddr as `0x${string}`) : undefined;

  const { write, txHash, isPending, isConfirming, isSuccess, error, reset } =
    useContractInteraction(validAddr, COUNTER_ABI as never, "increment");

  const { copied, copy } = useCopyToClipboard();

  function handleIncrement() {
    if (!isAddress(contractAddr)) {
      setAddrError("Enter a valid contract address");
      return;
    }
    setAddrError("");
    reset();
    write();
    if (isSuccess) {
      toast.success("increment() called!");
    }
  }

  if (!address) return null;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-sm">Interact with Deployed Counter</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Paste a Counter contract address to call <code className="text-gray-400">increment()</code>
        </p>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Contract Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={contractAddr}
          onChange={(e) => {
            setContractAddr(e.target.value);
            setAddrError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleIncrement()}
          className={`w-full bg-[#1a1a1a] border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition ${
            addrError ? "border-red-700 focus:border-red-500" : "border-[#333] focus:border-purple-500"
          }`}
          aria-label="Counter contract address"
        />
        {addrError && <p className="text-xs text-red-400 mt-1">{addrError}</p>}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleIncrement}
        disabled={!address || isPending || isConfirming}
        className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 font-semibold text-sm transition focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
      >
        {isPending
          ? "Waiting for approval…"
          : isConfirming
          ? "Confirming…"
          : "Call increment()"}
      </button>

      {txHash && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-xs space-y-1">
          <p className="text-gray-400">Transaction:</p>
          <div className="flex items-center gap-2">
            <a
              href={txUrl(chainId, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline font-mono break-all"
            >
              {txHash}
            </a>
            <button
              onClick={() => copy(txHash)}
              className="shrink-0 text-gray-600 hover:text-gray-300 transition"
              aria-label="Copy transaction hash"
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
          {isSuccess && (
            <p className="text-green-400 font-medium">increment() confirmed!</p>
          )}
        </div>
      )}
    </div>
  );
}
