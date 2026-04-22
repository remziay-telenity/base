"use client";

import { useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useDeployContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { COUNTER_ABI, COUNTER_BYTECODE } from "@/lib/contracts";

export function DeployContract() {
  const { address, chainId } = useAccount();
  const [deployedAddress, setDeployedAddress] = useState<string>("");

  const { deployContract, data: txHash, isPending, error } = useDeployContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });

  const isBaseMainnet = chainId === base.id;
  const explorerBase = isBaseMainnet
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

  function handleDeploy() {
    deployContract({
      abi: COUNTER_ABI,
      bytecode: COUNTER_BYTECODE,
      args: [],
    });
  }

  if (isSuccess && receipt?.contractAddress && !deployedAddress) {
    setDeployedAddress(receipt.contractAddress);
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold">
          2
        </div>
        <div>
          <h2 className="text-lg font-semibold">Deploy a Smart Contract</h2>
          <p className="text-sm text-gray-400">
            Unlocks: Builders &amp; Founders roles (1/5/10 contracts deployed)
          </p>
        </div>
        {isSuccess && (
          <span className="ml-auto text-green-400 text-sm font-medium">
            ✓ Done
          </span>
        )}
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-sm space-y-1">
        <p className="text-gray-400 font-medium">Contract: Counter.sol</p>
        <pre className="text-xs text-gray-300 overflow-x-auto">
{`contract Counter {
    uint256 public count;
    function increment() public {
        count += 1;
    }
}`}
        </pre>
      </div>

      {error && (
        <p className="text-red-400 text-sm">
          {error.message?.split("\n")[0] || "Deploy failed"}
        </p>
      )}

      <button
        onClick={handleDeploy}
        disabled={!address || isPending || isConfirming}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
      >
        {isPending
          ? "Waiting for approval..."
          : isConfirming
          ? "Deploying..."
          : "Deploy Counter Contract"}
      </button>

      {txHash && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm space-y-2">
          <div>
            <p className="text-gray-400">Deploy transaction:</p>
            <a
              href={`${explorerBase}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline font-mono text-xs break-all"
            >
              {txHash}
            </a>
          </div>
          {deployedAddress && (
            <div>
              <p className="text-gray-400">Contract deployed at:</p>
              <a
                href={`${explorerBase}/address/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline font-mono text-xs break-all"
              >
                {deployedAddress}
              </a>
              <p className="text-green-400 font-medium mt-1">
                Contract deployed successfully!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
