"use client";

import { useBasename } from "@/hooks/useBasename";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";

export function BasenameChecker() {
  const { chainId } = useAccount();
  const { basename, isLoading, hasBasename } = useBasename();
  const isBaseMainnet = chainId === base.id;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
          B
        </div>
        <div>
          <h3 className="font-semibold text-sm">Basename</h3>
          <p className="text-xs text-gray-400">Unlocks: Based role</p>
        </div>
        {hasBasename && (
          <span className="ml-auto text-green-400 text-sm font-medium">✓ Have one</span>
        )}
      </div>

      {!isBaseMainnet ? (
        <p className="text-xs text-yellow-400">
          Switch to Base Mainnet to check your Basename.
        </p>
      ) : isLoading ? (
        <p className="text-xs text-gray-500">Checking…</p>
      ) : hasBasename ? (
        <div className="bg-[#1a1a1a] rounded-lg px-4 py-2 text-sm font-mono text-indigo-300">
          {basename}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">No Basename found for this address.</p>
          <a
            href="https://www.base.org/names"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 transition"
          >
            Get a Basename →
          </a>
        </div>
      )}
    </div>
  );
}
