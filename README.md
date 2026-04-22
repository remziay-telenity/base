# Base Guild Helper

A web app that helps you complete on-chain roles on [guild.xyz/base](https://guild.xyz/base) — Coinbase's Base network guild.

## What it does

| Action | Guild roles unlocked |
|--------|----------------------|
| Send a transaction on Base | Onchain, Based: 10/50/100/1,000 transactions |
| Deploy a smart contract on Base | Builders & Founders (1/5/10+ contracts) |

Connect your wallet, perform the on-chain action, then visit [guild.xyz/base](https://guild.xyz/base) with the same wallet to claim your roles. Guild verifies on-chain state automatically — no further steps needed.

## Stack

- [Next.js](https://nextjs.org/) — React framework
- [wagmi v2](https://wagmi.sh/) + [viem](https://viem.sh/) — Ethereum interactions
- [RainbowKit](https://www.rainbowkit.com/) — wallet connect UI
- Supports **Base Mainnet** and **Base Sepolia** (testnet)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/your-username/base-guild-helper
cd base-guild-helper
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```
# Required — get free at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional — get free at https://basescan.org/myapikey
# Enables deployed contracts count; tx count falls back to on-chain nonce without it
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> `npm run dev` automatically compiles `contracts/Counter.sol` before starting.

## Project structure

```
contracts/
  Counter.sol           # Solidity source for the deployable contract
scripts/
  compile.js            # Compiles Counter.sol → src/lib/counterArtifact.json
src/
  app/
    page.tsx            # Main UI page
    layout.tsx          # Root layout with Web3Provider
  components/
    SendTransaction.tsx  # Send ETH transaction feature
    DeployContract.tsx   # Deploy smart contract feature
    NetworkBanner.tsx    # Network switcher banner
    RoleCard.tsx         # Guild role display card
  lib/
    wagmi.ts             # wagmi + RainbowKit config (Base chains)
    contracts.ts         # Contract ABI + bytecode exports
  providers/
    Web3Provider.tsx     # wagmi + RainbowKit + React Query provider
```

## Supported networks

| Network | Chain ID | Purpose |
|---------|----------|---------|
| Base Mainnet | 8453 | Real Guild.xyz roles |
| Base Sepolia | 84532 | Testing (free testnet ETH) |

Get testnet ETH at [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia).
