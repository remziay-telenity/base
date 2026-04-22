"use client";

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Abi } from "viem";

export interface ContractInteractionResult {
  write: (args?: readonly unknown[]) => void;
  txHash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Generic hook for calling a write function on a deployed contract.
 * Wraps wagmi's useWriteContract with simple error string state.
 */
export function useContractInteraction(
  contractAddress: `0x${string}` | undefined,
  abi: Abi,
  functionName: string
): ContractInteractionResult {
  const { address: userAddress } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const write = useCallback(
    (args: readonly unknown[] = []) => {
      if (!userAddress || !contractAddress) {
        setError("Wallet not connected or no contract address");
        return;
      }
      setError(null);
      writeContract(
        {
          address: contractAddress,
          abi,
          functionName,
          args,
        },
        {
          onError: (e) => setError(e.message?.split("\n")[0] || "Transaction failed"),
        }
      );
    },
    [userAddress, contractAddress, abi, functionName, writeContract]
  );

  const reset = useCallback(() => {
    setError(null);
    resetWrite();
  }, [resetWrite]);

  return { write, txHash, isPending, isConfirming, isSuccess, error, reset };
}
