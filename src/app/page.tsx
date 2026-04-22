"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { SendTransaction } from "@/components/SendTransaction";
import { DeployContract } from "@/components/DeployContract";
import { NetworkBanner } from "@/components/NetworkBanner";
import { RoleCard } from "@/components/RoleCard";
import { OnchainStats } from "@/components/OnchainStats";
import { BasenameChecker } from "@/components/BasenameChecker";
import { HoldingTracker } from "@/components/HoldingTracker";
import { BridgeLinks } from "@/components/BridgeLinks";
import { Footer } from "@/components/Footer";
import { TxHistory } from "@/components/TxHistory";
import { ActiveOnBase } from "@/components/ActiveOnBase";
import { ContractInteractor } from "@/components/ContractInteractor";
import { CounterReader } from "@/components/CounterReader";

const GUILD_ROLES = [
  {
    name: "Based",
    description: "Own a Basename on Base network",
    category: "Home",
    categoryColor: "bg-indigo-900 text-indigo-300",
  },
  {
    name: "Onchain",
    description: "Hold ≥0.001 ETH AND have ≥1 transaction on Base",
    category: "Home",
    categoryColor: "bg-blue-900 text-blue-300",
  },
  {
    name: "Holding: $1+",
    description: "Hold $1 or more in assets on Base",
    category: "Onchain",
    categoryColor: "bg-emerald-900 text-emerald-300",
  },
  {
    name: "Holding: $100+",
    description: "Hold $100 or more in assets on Base",
    category: "Onchain",
    categoryColor: "bg-emerald-900 text-emerald-300",
  },
  {
    name: "Holding: $1,000+",
    description: "Hold $1,000 or more in assets on Base",
    category: "Onchain",
    categoryColor: "bg-emerald-900 text-emerald-300",
  },
  {
    name: "Based: 10 transactions",
    description: "Complete 10 transactions on Base",
    category: "Onchain",
    categoryColor: "bg-blue-900 text-blue-300",
  },
  {
    name: "Based: 50 transactions",
    description: "Complete 50 transactions on Base",
    category: "Onchain",
    categoryColor: "bg-blue-900 text-blue-300",
  },
  {
    name: "Based: 100 transactions",
    description: "Complete 100 transactions on Base",
    category: "Onchain",
    categoryColor: "bg-blue-900 text-blue-300",
  },
  {
    name: "Based: 1,000 transactions",
    description: "Complete 1,000 transactions on Base",
    category: "Onchain",
    categoryColor: "bg-blue-900 text-blue-300",
  },
  {
    name: "Builders & Founders (1 contract)",
    description: "Deploy 1 smart contract on Base",
    category: "Builders",
    categoryColor: "bg-purple-900 text-purple-300",
  },
  {
    name: "Builders & Founders (5 contracts)",
    description: "Deploy 5 smart contracts on Base",
    category: "Builders",
    categoryColor: "bg-purple-900 text-purple-300",
  },
  {
    name: "Builders & Founders (10+ contracts)",
    description: "Deploy 10 or more smart contracts on Base",
    category: "Builders",
    categoryColor: "bg-purple-900 text-purple-300",
  },
];

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <NetworkBanner />

      <header className="border-b border-[#1a1a1a] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm">
            B
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base leading-tight truncate">Base Guild Helper</h1>
            <p className="text-xs text-gray-500 hidden sm:block">guild.xyz/base</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {!isConnected ? (
          <div className="text-center space-y-4 py-16">
            <div className="text-5xl">⛓️</div>
            <h2 className="text-2xl font-bold">Connect your wallet</h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Connect a wallet to start completing Base Guild roles on-chain.
            </p>
            <div className="flex justify-center mt-4">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold mb-1">Complete Roles</h2>
              <p className="text-sm text-gray-400">
                Use the actions below to earn on-chain credentials for{" "}
                <a href="https://guild.xyz/base" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  guild.xyz/base
                </a>
                . Guild verifies your on-chain activity automatically.
              </p>
            </div>

            {/* Stats overview */}
            <OnchainStats />

            {/* Role-specific cards */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-300">Check & Earn Roles</h2>
              <BasenameChecker />
              <HoldingTracker />
              <ActiveOnBase />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-300">On-chain Actions</h2>
              <SendTransaction />
              <DeployContract />
              <ContractInteractor />
              <CounterReader />
            </div>

            {/* Tx history */}
            <TxHistory />

            {/* Useful links */}
            <BridgeLinks />

            {/* Role checklist */}
            <div>
              <h2 className="text-xl font-bold mb-3">Roles unlocked by this app</h2>
              <div className="space-y-2">
                {GUILD_ROLES.map((role) => (
                  <RoleCard
                    key={role.name}
                    name={role.name}
                    description={role.description}
                    category={role.category}
                    categoryColor={role.categoryColor}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                After completing actions, visit{" "}
                <a href="https://guild.xyz/base" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  guild.xyz/base
                </a>{" "}
                and connect the same wallet to claim your roles.
              </p>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
