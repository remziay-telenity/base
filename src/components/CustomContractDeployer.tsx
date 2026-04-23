"use client";

import { useState } from "react";
import { useAccount, useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import { txUrl, addressUrl } from "@/lib/explorer";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { ContractInteractPanel } from "@/components/ContractInteractPanel";
import toast from "react-hot-toast";

const EXAMPLE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Calculator {
    // No storage, no owner, no events — pure math only

    function add(int256 a, int256 b) public pure returns (int256) {
        return a + b;
    }

    function subtract(int256 a, int256 b) public pure returns (int256) {
        return a - b;
    }

    function multiply(int256 a, int256 b) public pure returns (int256) {
        return a * b;
    }

    function divide(int256 a, int256 b) public pure returns (int256) {
        require(b != 0, "Cannot divide by zero");
        return a / b;
    }

    function power(int256 base, uint256 exp) public pure returns (int256) {
        int256 result = 1;
        int256 b = base;
        while (exp > 0) {
            if (exp % 2 == 1) result *= b;
            b *= b;
            exp /= 2;
        }
        return result;
    }
}`;

interface CompiledContract {
  name: string;
  abi: unknown[];
  bytecode: `0x${string}`;
}

export function CustomContractDeployer() {
  const { address, chainId, connector } = useAccount();
  const [source, setSource] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [contracts, setContracts] = useState<CompiledContract[]>([]);
  const [selected, setSelected] = useState(0);
  const [compileError, setCompileError] = useState("");
  const [deployedAddress, setDeployedAddress] = useState("");

  const { deployContract, data: txHash, isPending } = useDeployContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });
  const { copied: copiedTx, copy: copyTx } = useCopyToClipboard();
  const { copied: copiedAddr, copy: copyAddr } = useCopyToClipboard();

  if (isSuccess && receipt?.contractAddress && !deployedAddress) {
    setDeployedAddress(receipt.contractAddress);
  }

  async function handleCompile() {
    if (!source.trim()) {
      toast.error("Paste your Solidity code first");
      return;
    }
    setCompiling(true);
    setCompileError("");
    setContracts([]);
    setDeployedAddress("");

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      if (data.error) {
        setCompileError(data.error);
        toast.error("Compilation failed");
      } else {
        setContracts(data.contracts);
        setSelected(0);
        toast.success(`Compiled ${data.contracts.length} contract(s) successfully!`);
      }
    } catch {
      setCompileError("Failed to reach compiler. Try again.");
      toast.error("Compiler error");
    } finally {
      setCompiling(false);
    }
  }

  function handleDeploy() {
    const contract = contracts[selected];
    if (!contract) return;

    const onError = (e: Error) => {
      toast.error(e.message?.split("\n")[0] || "Deploy failed");
    };

    deployContract(
      { abi: contract.abi as never, bytecode: contract.bytecode, args: [] },
      { onError }
    );
  }

  if (!address) return null;

  const contract = contracts[selected];
  const canDeploy =
    !connector ||
    connector.type === "injected" ||
    connector.name?.toLowerCase().includes("metamask");

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-lg font-bold">
          ✦
        </div>
        <div>
          <h2 className="text-lg font-semibold">Deploy Custom Contract</h2>
          <p className="text-sm text-gray-400">Paste any Solidity code and deploy it directly</p>
        </div>
        {isSuccess && (
          <span className="ml-auto text-green-400 text-sm font-medium">✓ Deployed</span>
        )}
      </div>

      {/* Code textarea */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-400">Solidity Source Code</label>
          <button
            onClick={() => setSource(EXAMPLE)}
            className="text-xs text-green-400 hover:underline"
          >
            load example
          </button>
        </div>
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setContracts([]);
            setCompileError("");
            setDeployedAddress("");
          }}
          rows={12}
          spellCheck={false}
          placeholder={"// Paste your Solidity contract here\npragma solidity ^0.8.20;\n\ncontract MyContract { ... }"}
          style={{
            width: "100%",
            background: "#fff",
            color: "#000",
            WebkitTextFillColor: "#000",
            border: "1px solid #555",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "13px",
            fontFamily: "monospace",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Compile button */}
      <button
        onClick={handleCompile}
        disabled={compiling || !source.trim()}
        className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
      >
        {compiling ? "Compiling…" : "Compile"}
      </button>

      {/* Compile error */}
      {compileError && (
        <pre className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
          {compileError}
        </pre>
      )}

      {/* Contract selector (if multiple contracts) */}
      {contracts.length > 1 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-400">Select contract to deploy:</p>
          <div className="flex flex-wrap gap-2">
            {contracts.map((c, i) => (
              <button
                key={c.name}
                onClick={() => { setSelected(i); setDeployedAddress(""); }}
                className={`px-3 py-1 rounded-lg text-sm border transition ${
                  i === selected
                    ? "border-green-500 bg-green-950/40 text-green-300"
                    : "border-[#333] text-gray-400 hover:border-[#555]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compiled result */}
      {contract && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 space-y-2 text-xs">
          <p className="text-green-400 font-semibold">✓ {contract.name} compiled successfully</p>
          <p className="text-gray-500">
            Bytecode size: {((contract.bytecode.length - 2) / 2).toLocaleString()} bytes
          </p>
          <p className="text-gray-500">ABI functions: {contract.abi.filter((x: unknown) => (x as {type:string}).type === "function").length}</p>
        </div>
      )}

      {/* Deploy button */}
      {contract && (
        <>
          {!canDeploy && (
            <div className="bg-yellow-950/60 border border-yellow-800 rounded-lg px-3 py-2 text-xs text-yellow-300">
              ⚠ {connector?.name} doesn't support contract deployment. Use MetaMask or Coinbase Wallet browser extension.
            </div>
          )}
          <button
            onClick={handleDeploy}
            disabled={!address || isPending || isConfirming || !canDeploy}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
          >
            {isPending ? "Waiting for approval…" : isConfirming ? "Deploying…" : `Deploy ${contract.name}`}
          </button>
        </>
      )}

      {/* Tx result */}
      {txHash && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm space-y-2">
          <div>
            <p className="text-gray-400 mb-0.5">Transaction:</p>
            <div className="flex items-center gap-2">
              <a href={txUrl(chainId, txHash)} target="_blank" rel="noopener noreferrer"
                className="text-purple-400 hover:underline font-mono text-xs break-all">
                {txHash}
              </a>
              <button onClick={() => copyTx(txHash)} className="shrink-0 text-xs text-gray-500 hover:text-gray-300">
                {copiedTx ? "✓" : "⧉"}
              </button>
            </div>
          </div>
          {deployedAddress && (
            <div>
              <p className="text-gray-400 mb-0.5">Contract deployed at:</p>
              <div className="flex items-center gap-2">
                <a href={addressUrl(chainId, deployedAddress)} target="_blank" rel="noopener noreferrer"
                  className="text-green-400 hover:underline font-mono text-xs break-all">
                  {deployedAddress}
                </a>
                <button onClick={() => copyAddr(deployedAddress)} className="shrink-0 text-xs text-gray-500 hover:text-gray-300">
                  {copiedAddr ? "✓" : "⧉"}
                </button>
              </div>
              <p className="text-green-400 font-medium mt-1">Deployed successfully!</p>
            </div>
          )}
        </div>
      )}

      {/* Interact panel — appears after deployment */}
      {deployedAddress && contract && (
        <ContractInteractPanel
          contractAddress={deployedAddress as `0x${string}`}
          abi={contract.abi as never}
          chainId={chainId}
        />
      )}
    </div>
  );
}
