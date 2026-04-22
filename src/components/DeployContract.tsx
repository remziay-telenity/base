"use client";

import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useDeployContract } from "wagmi";
import { COUNTER_ABI, COUNTER_BYTECODE } from "@/lib/contracts";
import { useDeployedContracts, CONTRACT_MILESTONES } from "@/hooks/useDeployedContracts";
import { txUrl, addressUrl } from "@/lib/explorer";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import toast from "react-hot-toast";
import counterArtifact from "@/lib/counterArtifact.json";
import tokenArtifact from "@/lib/simpleTokenArtifact.json";
import nftArtifact from "@/lib/simpleNFTArtifact.json";

type ContractType = "counter" | "token" | "nft";

interface ContractTemplate {
  id: ContractType;
  label: string;
  description: string;
  color: string;
  preview: string;
  fields: { name: string; label: string; placeholder: string; type: string; optional?: boolean }[];
}

const TEMPLATES: ContractTemplate[] = [
  {
    id: "counter",
    label: "Counter",
    description: "Simple on-chain counter",
    color: "bg-purple-600",
    preview: `contract Counter {\n  uint256 public count;\n  function increment() public { count++; }\n}`,
    fields: [],
  },
  {
    id: "token",
    label: "ERC-20 Token",
    description: "Fungible token with custom name & supply",
    color: "bg-yellow-600",
    preview: `contract SimpleToken {\n  string public name;\n  string public symbol;\n  uint256 public totalSupply;\n  uint256 public feeBps; // 0 = no fee\n  // standard ERC-20 functions\n}`,
    fields: [
      { name: "tokenName", label: "Token Name", placeholder: "My Token", type: "text" },
      { name: "tokenSymbol", label: "Symbol", placeholder: "MTK", type: "text" },
      { name: "tokenSupply", label: "Initial Supply", placeholder: "1000000", type: "number" },
      { name: "tokenFee", label: "Transfer Fee % (optional, 0–10)", placeholder: "0", type: "number", optional: true },
    ],
  },
  {
    id: "nft",
    label: "ERC-721 NFT",
    description: "Non-fungible token collection",
    color: "bg-pink-600",
    preview: `contract SimpleNFT {\n  string public name;\n  string public symbol;\n  function mint(address to) external;\n}`,
    fields: [
      { name: "nftName", label: "Collection Name", placeholder: "My NFT", type: "text" },
      { name: "nftSymbol", label: "Symbol", placeholder: "MNFT", type: "text" },
    ],
  },
];

export function DeployContract() {
  const { address, chainId, connector } = useAccount();
  const [selected, setSelected] = useState<ContractType>("counter");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [deployedAddress, setDeployedAddress] = useState<string>("");

  const { deployContract, data: txHash, isPending, error } = useDeployContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });
  const { count, isLoading: statsLoading, error: statsError, refetch: refetchStats } =
    useDeployedContracts();
  const { copied: copiedTx, copy: copyTx } = useCopyToClipboard();
  const { copied: copiedAddr, copy: copyAddr } = useCopyToClipboard();

  const template = TEMPLATES.find((t) => t.id === selected)!;

  useEffect(() => {
    if (isSuccess) {
      refetchStats();
      toast.success(`${template.label} deployed successfully!`);
    }
  }, [isSuccess]);

  useEffect(() => {
    // Reset deployed address on template change
    setDeployedAddress("");
    setFields({});
  }, [selected]);

  if (isSuccess && receipt?.contractAddress && !deployedAddress) {
    setDeployedAddress(receipt.contractAddress);
  }

  function validate(): string | null {
    if (selected === "token") {
      if (!fields.tokenName?.trim()) return "Token Name is required";
      if (!fields.tokenSymbol?.trim()) return "Symbol is required";
      const supply = Number(fields.tokenSupply);
      if (fields.tokenSupply && (isNaN(supply) || supply <= 0))
        return "Initial Supply must be a positive number";
      const fee = fields.tokenFee ? Number(fields.tokenFee) : 0;
      if (isNaN(fee) || fee < 0 || fee > 10)
        return "Transfer Fee must be between 0 and 10%";
    }
    if (selected === "nft") {
      if (!fields.nftName?.trim()) return "Collection Name is required";
      if (!fields.nftSymbol?.trim()) return "Symbol is required";
    }
    return null;
  }

  function handleDeploy() {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const onError = (e: Error) => {
      const msg = e.message || "";
      if (msg.includes("params[0].to") || msg.includes("required field") || msg.includes("to is a required")) {
        toast.error(`${connector?.name ?? "This wallet"} doesn't support deployment — use MetaMask or Coinbase Wallet browser extension`);
      } else {
        toast.error(msg.split("\n")[0] || "Deploy failed");
      }
    };

    if (selected === "counter") {
      deployContract({ abi: COUNTER_ABI, bytecode: COUNTER_BYTECODE, args: [] }, { onError });
    } else if (selected === "token") {
      // Convert fee % to basis points (e.g. 1.5% → 150 bps). Default 0 = no fee.
      const feeBps = BigInt(Math.round((Number(fields.tokenFee) || 0) * 100));
      deployContract({
        abi: tokenArtifact.abi as never,
        bytecode: tokenArtifact.bytecode as `0x${string}`,
        args: [
          fields.tokenName!.trim(),
          fields.tokenSymbol!.trim(),
          BigInt(fields.tokenSupply || "1000000"),
          feeBps,
        ],
      }, { onError });
    } else if (selected === "nft") {
      deployContract({
        abi: nftArtifact.abi as never,
        bytecode: nftArtifact.bytecode as `0x${string}`,
        args: [fields.nftName!.trim(), fields.nftSymbol!.trim()],
      }, { onError });
    }
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
            Unlocks: Builders &amp; Founders roles (1/5/10 contracts)
          </p>
          {count > 0 && (
            <span className="text-xs text-gray-500 mt-0.5">{count} deployed so far</span>
          )}
        </div>
        {isSuccess && (
          <span className="ml-auto text-green-400 text-sm font-medium">✓ Done</span>
        )}
      </div>

      {/* Template selector */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Contract type">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            aria-pressed={selected === t.id}
            aria-label={`Select ${t.label} contract template`}
            className={`p-2.5 rounded-xl border text-left transition focus-visible:ring-2 focus-visible:ring-purple-500 ${
              selected === t.id
                ? "border-purple-500 bg-purple-950/40"
                : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#444]"
            }`}
          >
            <p className="text-xs font-semibold">{t.label}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{t.description}</p>
          </button>
        ))}
      </div>

      {/* Contract preview */}
      <pre className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
        {template.preview}
      </pre>

      {/* Dynamic fields */}
      {template.fields.length > 0 && (
        <div className="space-y-2">
          {template.fields.map((f) => {
            const isRequired = !f.optional && f.type !== "number";
            const isEmpty = isRequired && !fields[f.name]?.trim();
            return (
              <div key={f.name}>
                <label className="text-xs text-gray-400 mb-1 block">
                  {f.label}
                  {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={fields[f.name] || ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                  aria-required={isRequired}
                  aria-invalid={isEmpty ? "true" : undefined}
                  className={`w-full bg-[#333] border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition ${
                    isEmpty
                      ? "border-red-800 focus:border-red-500"
                      : "border-[#333] focus:border-purple-500"
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Milestones */}
      {!statsLoading && !statsError && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Milestones</p>
          {CONTRACT_MILESTONES.map((milestone) => {
            const done = count >= milestone;
            return (
              <div key={milestone} className="flex items-center justify-between text-sm">
                <span className={done ? "text-green-400" : "text-gray-400"}>
                  {done ? "✓ " : ""}{milestone} contract{milestone > 1 ? "s" : ""} deployed
                </span>
                <span className={done ? "text-green-400 font-medium" : "text-gray-600"}>
                  {done ? "complete" : `${count}/${milestone}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error.message?.split("\n")[0] || "Deploy failed"}</p>
      )}

      {/* Smart wallets (Base Wallet, Coinbase Smart Wallet) and WalletConnect v2 both
          reject eth_sendTransaction without a `to` field, which contract deployments
          require. Only browser-injected wallets (MetaMask, Coinbase browser extension)
          process raw deployment transactions locally without that schema validation. */}
      {connector && connector.type !== "injected" && !connector.name?.toLowerCase().includes("metamask") && (
        <div className="bg-yellow-950/60 border border-yellow-800 rounded-lg px-3 py-2.5 text-xs text-yellow-300 space-y-1">
          <p className="font-semibold">⚠ {connector.name} doesn't support contract deployment</p>
          <p className="text-yellow-400">
            Smart wallets and WalletConnect reject deployment transactions (no recipient address).
            To deploy contracts, please use a browser extension wallet:{" "}
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-yellow-200 underline"
            >
              MetaMask
            </a>
            {" or "}
            <a
              href="https://www.coinbase.com/wallet/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-yellow-200 underline"
            >
              Coinbase Wallet (browser extension)
            </a>
            .
          </p>
        </div>
      )}

      <button
        onClick={handleDeploy}
        disabled={!address || isPending || isConfirming || (connector?.type !== "injected" && !connector?.name?.toLowerCase().includes("metamask") && !!connector)}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
      >
        {isPending ? "Waiting for approval…" : isConfirming ? "Deploying…" : `Deploy ${template.label}`}
      </button>

      {txHash && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm space-y-2">
          <div>
            <p className="text-gray-400 mb-0.5">Deploy transaction:</p>
            <div className="flex items-center gap-2">
              <a
                href={txUrl(chainId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline font-mono text-xs break-all"
              >
                {txHash}
              </a>
              <button
                onClick={() => copyTx(txHash)}
                className="shrink-0 text-xs text-gray-500 hover:text-gray-300 transition"
                aria-label="Copy transaction hash"
              >
                {copiedTx ? "✓" : "⧉"}
              </button>
            </div>
          </div>
          {deployedAddress && (
            <div>
              <p className="text-gray-400 mb-0.5">Contract deployed at:</p>
              <div className="flex items-center gap-2">
                <a
                  href={addressUrl(chainId, deployedAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline font-mono text-xs break-all"
                >
                  {deployedAddress}
                </a>
                <button
                  onClick={() => copyAddr(deployedAddress)}
                  className="shrink-0 text-xs text-gray-500 hover:text-gray-300 transition"
                  aria-label="Copy contract address"
                >
                  {copiedAddr ? "✓" : "⧉"}
                </button>
              </div>
              <p className="text-green-400 font-medium mt-1">Deployed successfully!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
