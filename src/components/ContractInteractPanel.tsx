"use client";

import { useState } from "react";
import { usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { txUrl } from "@/lib/explorer";
import toast from "react-hot-toast";

interface AbiItem {
  name: string;
  type: string;
  stateMutability?: string;
  inputs?: { name: string; type: string }[];
  outputs?: { name: string; type: string }[];
}

interface Props {
  contractAddress: `0x${string}`;
  abi: AbiItem[];
  chainId?: number;
}

function coerceArg(value: string, type: string): unknown {
  const v = value.trim();
  if (type.startsWith("uint") || type.startsWith("int")) {
    return BigInt(v || "0");
  }
  if (type === "bool") return v === "true" || v === "1";
  if (type === "bytes32") {
    if (v.startsWith("0x")) return v.padEnd(66, "0") as `0x${string}`;
    const hex = Array.from(v)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
      .padEnd(64, "0");
    return `0x${hex}` as `0x${string}`;
  }
  if (type.startsWith("bytes")) return v as `0x${string}`;
  return v;
}

function formatResult(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.map(formatResult).join(", ");
  if (typeof value === "object") return JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
  return String(value);
}

export function ContractInteractPanel({ contractAddress, abi, chainId }: Props) {
  const publicClient = usePublicClient();
  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [inputs, setInputs] = useState<Record<string, string[]>>({});
  const [readResults, setReadResults] = useState<Record<string, string>>({});
  const [readLoading, setReadLoading] = useState<Record<string, boolean>>({});
  const [pendingWrite, setPendingWrite] = useState<string | null>(null);

  const functions = abi.filter((item) => item.type === "function");
  const readFns = functions.filter(
    (f) => f.stateMutability === "view" || f.stateMutability === "pure"
  );
  const writeFns = functions.filter(
    (f) => f.stateMutability === "nonpayable" || f.stateMutability === "payable"
  );

  function getInputs(fnName: string, count: number): string[] {
    return inputs[fnName] || Array(count).fill("");
  }

  function setInput(fnName: string, index: number, value: string, count: number) {
    const current = getInputs(fnName, count);
    const updated = [...current];
    updated[index] = value;
    setInputs((prev) => ({ ...prev, [fnName]: updated }));
  }

  async function handleRead(fn: AbiItem) {
    if (!publicClient) return;
    setReadLoading((prev) => ({ ...prev, [fn.name]: true }));
    try {
      const args = (fn.inputs || []).map((inp, i) =>
        coerceArg(getInputs(fn.name, fn.inputs?.length || 0)[i] || "", inp.type)
      );
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: abi as never,
        functionName: fn.name,
        args,
      });
      setReadResults((prev) => ({ ...prev, [fn.name]: formatResult(result) }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
      setReadResults((prev) => ({ ...prev, [fn.name]: `Error: ${msg}` }));
      toast.error(msg);
    } finally {
      setReadLoading((prev) => ({ ...prev, [fn.name]: false }));
    }
  }

  function handleWrite(fn: AbiItem) {
    setPendingWrite(fn.name);
    const args = (fn.inputs || []).map((inp, i) =>
      coerceArg(getInputs(fn.name, fn.inputs?.length || 0)[i] || "", inp.type)
    );
    writeContract(
      {
        address: contractAddress,
        abi: abi as never,
        functionName: fn.name,
        args,
      },
      {
        onError: (e) => {
          toast.error(e.message?.split("\n")[0] || "Transaction failed");
          setPendingWrite(null);
        },
        onSuccess: () => setPendingWrite(null),
      }
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="border-t border-[#222] pt-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
          Interacting with{" "}
          <span className="font-mono text-gray-300">
            {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}
          </span>
        </p>

        {/* Read functions */}
        {readFns.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              📖 Read
            </p>
            {readFns.map((fn) => (
              <div key={fn.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 space-y-2">
                <p className="text-sm font-mono text-blue-300">{fn.name}()</p>
                {(fn.inputs || []).map((inp, i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-500 mb-0.5 block">
                      {inp.name || `arg${i}`} <span className="text-gray-600">({inp.type})</span>
                    </label>
                    <input
                      style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "6px", padding: "6px 10px", width: "100%", fontSize: "13px", boxSizing: "border-box" }}
                      placeholder={inp.type}
                      value={getInputs(fn.name, fn.inputs?.length || 0)[i] || ""}
                      onChange={(e) => setInput(fn.name, i, e.target.value, fn.inputs?.length || 0)}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRead(fn)}
                    disabled={readLoading[fn.name]}
                    className="bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded px-3 py-1.5 text-xs font-semibold transition"
                  >
                    {readLoading[fn.name] ? "Reading…" : "Read"}
                  </button>
                  {readResults[fn.name] !== undefined && (
                    <span className={`text-xs font-mono ${readResults[fn.name].startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                      → {readResults[fn.name]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Write functions */}
        {writeFns.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              ✍️ Write
            </p>
            {writeFns.map((fn) => (
              <div key={fn.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 space-y-2">
                <p className="text-sm font-mono text-purple-300">{fn.name}()</p>
                {(fn.inputs || []).map((inp, i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-500 mb-0.5 block">
                      {inp.name || `arg${i}`} <span className="text-gray-600">({inp.type})</span>
                    </label>
                    <input
                      style={{ background: "#fff", color: "#000", border: "1px solid #555", borderRadius: "6px", padding: "6px 10px", width: "100%", fontSize: "13px", boxSizing: "border-box" }}
                      placeholder={inp.type}
                      value={getInputs(fn.name, fn.inputs?.length || 0)[i] || ""}
                      onChange={(e) => setInput(fn.name, i, e.target.value, fn.inputs?.length || 0)}
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleWrite(fn)}
                  disabled={!!pendingWrite || isConfirming}
                  className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 rounded px-3 py-1.5 text-xs font-semibold transition"
                >
                  {pendingWrite === fn.name
                    ? "Waiting…"
                    : isConfirming && pendingWrite === fn.name
                    ? "Confirming…"
                    : `Send ${fn.name}()`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Write tx result */}
        {txHash && (
          <div className="mt-3 bg-[#1a1a1a] rounded-lg p-3 text-xs space-y-1">
            <p className="text-gray-400">Last transaction:</p>
            <a
              href={txUrl(chainId, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline font-mono break-all"
            >
              {txHash}
            </a>
            {isSuccess && <p className="text-green-400 font-medium">✓ Confirmed</p>}
          </div>
        )}
      </div>
    </div>
  );
}
