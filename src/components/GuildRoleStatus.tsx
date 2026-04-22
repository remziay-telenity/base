"use client";

import { useTransactionStats } from "@/hooks/useTransactionStats";
import { useDeployedContracts } from "@/hooks/useDeployedContracts";
import { useBasename } from "@/hooks/useBasename";

interface RoleStatus {
  name: string;
  achieved: boolean;
  description: string;
}

export function GuildRoleStatus() {
  const { txCount, ethBalance } = useTransactionStats();
  const { count: contractCount } = useDeployedContracts();
  const { hasBasename } = useBasename();

  const balanceFloat = ethBalance !== null ? parseFloat(ethBalance) : 0;
  const txs = txCount ?? 0;

  const roles: RoleStatus[] = [
    {
      name: "Based",
      achieved: hasBasename,
      description: "Own a Basename",
    },
    {
      name: "Onchain",
      achieved: balanceFloat >= 0.001 && txs >= 1,
      description: "≥0.001 ETH + ≥1 tx",
    },
    {
      name: "Based: 10 transactions",
      achieved: txs >= 10,
      description: "10+ outgoing txs",
    },
    {
      name: "Based: 50 transactions",
      achieved: txs >= 50,
      description: "50+ outgoing txs",
    },
    {
      name: "Based: 100 transactions",
      achieved: txs >= 100,
      description: "100+ outgoing txs",
    },
    {
      name: "Based: 1,000 transactions",
      achieved: txs >= 1000,
      description: "1,000+ outgoing txs",
    },
    {
      name: "Builders & Founders (1 contract)",
      achieved: contractCount >= 1,
      description: "Deploy 1 contract",
    },
    {
      name: "Builders & Founders (5 contracts)",
      achieved: contractCount >= 5,
      description: "Deploy 5 contracts",
    },
    {
      name: "Builders & Founders (10+ contracts)",
      achieved: contractCount >= 10,
      description: "Deploy 10+ contracts",
    },
  ];

  const achieved = roles.filter((r) => r.achieved).length;

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Guild Role Status</h3>
        <span className="text-xs font-medium text-gray-400">
          {achieved} / {roles.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
              role.achieved
                ? "bg-green-950/40 border border-green-900"
                : "bg-[#1a1a1a] border border-[#2a2a2a]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={role.achieved ? "text-green-400" : "text-gray-600"}>
                {role.achieved ? "✓" : "○"}
              </span>
              <span className={role.achieved ? "text-green-300" : "text-gray-400"}>
                {role.name}
              </span>
            </div>
            <span className="text-gray-600 text-right">{role.description}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600">
        After completing actions, claim your roles at{" "}
        <a
          href="https://guild.xyz/base"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          guild.xyz/base
        </a>
      </p>
    </div>
  );
}
