"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import artifact from "@/lib/donationVaultArtifact.json";
import { txUrl, addressUrl } from "@/lib/explorer";
import toast from "react-hot-toast";

const ABI = artifact.abi as never;
const BYTECODE = artifact.bytecode as `0x${string}`;

// Pre-deployed vault — users go straight to donate screen
const DEFAULT_VAULT = "0xa9a6ab325898F4047a5413DA4430c0750fa50dAD" as `0x${string}`;

export function DonationBox() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();

  // Deploy vault
  const { deployContract, data: deployTxHash, isPending: isDeploying } = useDeployContract();
  const { isSuccess: deploySuccess, data: deployReceipt } =
    useWaitForTransactionReceipt({ hash: deployTxHash });

  // Vault state
  const [vaultAddress, setVaultAddress] = useState<`0x${string}` | "">(DEFAULT_VAULT);
  const [vaultInput, setVaultInput] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [totalDonations, setTotalDonations] = useState<string | null>(null);
  const [donorCount, setDonorCount] = useState<string | null>(null);
  const [myDonation, setMyDonation] = useState<string | null>(null);
  const [vaultOwner, setVaultOwner] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Donate
  const [donateAmount, setDonateAmount] = useState("0.001");
  const { writeContract: donate, data: donateTxHash, isPending: isDonating } = useWriteContract();
  const { isSuccess: donateSuccess } = useWaitForTransactionReceipt({ hash: donateTxHash });

  // Withdraw
  const { writeContract: withdraw, data: withdrawTxHash, isPending: isWithdrawing } = useWriteContract();
  const { isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

  // On deploy success, set vault address
  useEffect(() => {
    if (deploySuccess && deployReceipt?.contractAddress) {
      setVaultAddress(deployReceipt.contractAddress);
      toast.success("Vault deployed!");
    }
  }, [deploySuccess, deployReceipt]);

  // Refresh stats after donate/withdraw
  useEffect(() => { if (donateSuccess) { toast.success("Donation confirmed!"); fetchStats(); } }, [donateSuccess]);
  useEffect(() => { if (withdrawSuccess) { toast.success("Withdrawal confirmed!"); fetchStats(); } }, [withdrawSuccess]);

  const fetchStats = useCallback(async () => {
    if (!vaultAddress || !publicClient) return;
    setLoadingStats(true);
    try {
      const [bal, total, donors, myAmt, owner] = await Promise.all([
        publicClient.getBalance({ address: vaultAddress }),
        publicClient.readContract({ address: vaultAddress, abi: ABI, functionName: "totalDonations" }),
        publicClient.readContract({ address: vaultAddress, abi: ABI, functionName: "donorCount" }),
        address
          ? publicClient.readContract({ address: vaultAddress, abi: ABI, functionName: "donorAmount", args: [address] })
          : Promise.resolve(BigInt(0)),
        publicClient.readContract({ address: vaultAddress, abi: ABI, functionName: "owner" }),
      ]);
      setBalance(formatEther(bal as bigint));
      setTotalDonations(formatEther(total as bigint));
      setDonorCount(String(donors));
      setMyDonation(formatEther(myAmt as bigint));
      setVaultOwner(owner as string);
    } catch {
      toast.error("Failed to load vault stats");
    } finally {
      setLoadingStats(false);
    }
  }, [vaultAddress, publicClient, address]);

  useEffect(() => {
    if (vaultAddress) fetchStats();
  }, [vaultAddress, fetchStats]);

  function handleDeploy() {
    deployContract(
      { abi: ABI, bytecode: BYTECODE, args: [] },
      { onError: (e) => toast.error(e.message?.split("\n")[0] || "Deploy failed") }
    );
  }

  function handleUseExisting() {
    if (!isAddress(vaultInput)) { toast.error("Invalid address"); return; }
    setVaultAddress(vaultInput as `0x${string}`);
  }

  function handleDonate() {
    if (!vaultAddress) return;
    donate(
      { address: vaultAddress, abi: ABI, functionName: "donate", value: parseEther(donateAmount || "0") },
      { onError: (e) => toast.error(e.message?.split("\n")[0] || "Donation failed") }
    );
  }

  function handleWithdraw() {
    if (!vaultAddress) return;
    withdraw(
      { address: vaultAddress, abi: ABI, functionName: "withdraw" },
      { onError: (e) => toast.error(e.message?.split("\n")[0] || "Withdraw failed") }
    );
  }

  const isOwner =
    !!vaultOwner && !!address && vaultOwner.toLowerCase() === address.toLowerCase();

  if (!address) return null;

  return (
    <div className="space-y-4">
      {/* Donate card — visible to everyone */}
      {vaultAddress && (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg">
              💛
            </div>
            <div>
              <h2 className="text-lg font-semibold">Donate ETH</h2>
              <p className="text-sm text-gray-400">Send ETH to the vault on Base</p>
            </div>
          </div>

          <a
            href={addressUrl(chainId, vaultAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-yellow-400 hover:underline block"
          >
            Vault: {vaultAddress.slice(0, 10)}…{vaultAddress.slice(-8)}
          </a>

          <div className="space-y-2">
            <div className="flex gap-2">
              {["0.0001", "0.001", "0.01"].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDonateAmount(amt)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition ${
                    donateAmount === amt ? "border-yellow-500 bg-yellow-950/40 text-yellow-300" : "border-[#333] text-gray-400 hover:border-[#555]"
                  }`}
                >
                  {amt} ETH
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "14px", boxSizing: "border-box" }}
                type="number"
                step="0.0001"
                min="0"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="0.001"
              />
              <button
                onClick={handleDonate}
                disabled={isDonating}
                className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-5 py-2 font-semibold text-sm transition"
              >
                {isDonating ? "…" : "Donate 💛"}
              </button>
            </div>
            {donateTxHash && (
              <a href={txUrl(chainId, donateTxHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 hover:underline font-mono block truncate">
                tx: {donateTxHash}
              </a>
            )}
          </div>

          {myDonation !== null && Number(myDonation) > 0 && (
            <p className="text-xs text-gray-500 text-center">
              Your total donations: <span className="text-white font-mono">{Number(myDonation).toFixed(6)} ETH</span>
            </p>
          )}
        </div>
      )}

      {/* Owner panel — visible only to the vault owner */}
      {isOwner && vaultAddress && (
        <div className="bg-yellow-950/20 border border-yellow-600/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg">
              👑
            </div>
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Vault Owner Panel</h2>
              <p className="text-sm text-yellow-600">Only visible to the vault owner</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a
              href={addressUrl(chainId, vaultAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-yellow-400 hover:underline"
            >
              {vaultAddress.slice(0, 10)}…{vaultAddress.slice(-8)}
            </a>
            <div className="flex gap-2">
              <button onClick={fetchStats} disabled={loadingStats} className="text-xs text-gray-500 hover:text-gray-300 transition">
                {loadingStats ? "…" : "↻ refresh"}
              </button>
              <button onClick={() => { setVaultAddress(""); setVaultInput(""); setBalance(null); }} className="text-xs text-gray-500 hover:text-red-400 transition">
                ✕ change
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Vault Balance", value: balance !== null ? `${Number(balance).toFixed(6)} ETH` : "…" },
              { label: "Total Donated", value: totalDonations !== null ? `${Number(totalDonations).toFixed(6)} ETH` : "…" },
              { label: "Donors", value: donorCount ?? "…" },
            ].map((s) => (
              <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-sm font-bold text-yellow-400">{s.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || balance === "0.000000"}
            className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            {isWithdrawing ? "Withdrawing…" : `Withdraw all (${Number(balance ?? 0).toFixed(6)} ETH)`}
          </button>
          {withdrawTxHash && (
            <a href={txUrl(chainId, withdrawTxHash)} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 hover:underline font-mono block truncate">
              tx: {withdrawTxHash}
            </a>
          )}
        </div>
      )}

      {/* Set up a vault — only shown when owner cleared the current vault */}
      {!vaultAddress && (
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg">
              💰
            </div>
            <div>
              <h2 className="text-lg font-semibold">Set up vault</h2>
              <p className="text-sm text-gray-400">Deploy a new vault or point to an existing one</p>
            </div>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 font-semibold text-sm transition"
          >
            {isDeploying ? "Deploying vault…" : "Deploy New Vault"}
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex-1 border-t border-[#333]" />
            or use existing
            <div className="flex-1 border-t border-[#333]" />
          </div>

          <div className="flex gap-2">
            <input
              style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "8px", padding: "8px 12px", flex: 1, fontSize: "13px", boxSizing: "border-box" }}
              placeholder="Paste vault contract address 0x..."
              value={vaultInput}
              onChange={(e) => setVaultInput(e.target.value)}
            />
            <button
              onClick={handleUseExisting}
              className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-lg px-4 py-2 text-sm transition"
            >
              Use
            </button>
          </div>

          {deployTxHash && (
            <div className="text-xs text-gray-400">
              Deploying…{" "}
              <a href={txUrl(chainId, deployTxHash)} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline font-mono">
                {deployTxHash.slice(0, 16)}…
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
