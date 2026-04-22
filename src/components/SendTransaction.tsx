"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, isAddress } from "viem";
import { useTransactionStats } from "@/hooks/useTransactionStats";
import { txUrl } from "@/lib/explorer";
import toast from "react-hot-toast";

export function SendTransaction() {
  const { address, chainId } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.0001");
  const [txError, setTxError] = useState("");

  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const { txCount, refetch: refetchStats } = useTransactionStats();

  useEffect(() => {
    if (isSuccess) {
      refetchStats();
      toast.success("Transaction confirmed! Stats will update shortly.");
    }
  }, [isSuccess]);

  async function handleSend() {
    setTxError("");
    if (!isAddress(to)) {
      const msg = "Invalid recipient address";
      setTxError(msg);
      toast.error(msg);
      return;
    }
    try {
      sendTransaction(
        { to: to as `0x${string}`, value: parseEther(amount || "0") },
        {
          onError: (e) => {
            const msg = e.message?.split("\n")[0] || "Transaction failed";
            setTxError(msg);
            toast.error(msg);
          },
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setTxError(msg);
      toast.error(msg);
    }
  }


  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
          1
        </div>
        <div>
          <h2 className="text-lg font-semibold">Send a Transaction</h2>
          <p className="text-sm text-gray-400">
            Unlocks: Onchain role, Based: 10/50/100/1000 tx roles
          </p>
          {txCount !== null && (
            <span className="text-xs text-gray-500 mt-0.5">
              {txCount.toLocaleString()} txs so far
            </span>
          )}
        </div>
        {isSuccess && (
          <span className="ml-auto text-green-400 text-sm font-medium">
            ✓ Done
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Recipient Address
          </label>
          <input
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 transition"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Amount (ETH)
          </label>
          <input
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 transition"
            placeholder="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.0001"
            min="0"
          />
        </div>

        <div className="text-xs text-gray-500">
          Tip: You can send to yourself (
          <button
            className="text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            onClick={() => address && setTo(address)}
            aria-label="Use my wallet address as recipient"
          >
            use my address
          </button>
          ) to count as a transaction.
        </div>

        {txError && (
          <p className="text-red-400 text-sm">{txError}</p>
        )}

        <button
          onClick={handleSend}
          disabled={!address || isPending || isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
        >
          {isPending
            ? "Waiting for approval..."
            : isConfirming
            ? "Confirming..."
            : "Send Transaction"}
        </button>
      </div>

      {txHash && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm space-y-1">
          <p className="text-gray-400">Transaction hash:</p>
          <a
            href={txUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-mono text-xs break-all"
          >
            {txHash}
          </a>
          {isSuccess && (
            <p className="text-green-400 font-medium">Transaction confirmed!</p>
          )}
        </div>
      )}
    </div>
  );
}
