"use client";

import { useAccount } from "wagmi";
import { base } from "wagmi/chains";

const LINKS = [
  {
    label: "Base Bridge",
    description: "Bridge ETH from Ethereum to Base",
    url: "https://bridge.base.org",
    icon: "🌉",
    mainnetOnly: true,
  },
  {
    label: "Base Sepolia Faucet",
    description: "Get free testnet ETH for Base Sepolia",
    url: "https://faucet.quicknode.com/base/sepolia",
    icon: "🚰",
    mainnetOnly: false,
  },
  {
    label: "Coinbase",
    description: "Buy ETH directly with Coinbase",
    url: "https://www.coinbase.com/buy-ethereum",
    icon: "💳",
    mainnetOnly: false,
  },
  {
    label: "Base Names",
    description: "Register a Basename (.base)",
    url: "https://www.base.org/names",
    icon: "🏷️",
    mainnetOnly: true,
  },
];

export function BridgeLinks() {
  const { chainId } = useAccount();
  const isMainnet = chainId === base.id;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <h3 className="font-semibold text-sm">Useful Links</h3>
      <div className="grid grid-cols-2 gap-2">
        {LINKS.filter((l) => !l.mainnetOnly || isMainnet).map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#333] rounded-xl transition group"
          >
            <span className="text-xl leading-none mt-0.5">{link.icon}</span>
            <div>
              <p className="text-xs font-semibold group-hover:text-white transition">
                {link.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
