# Base Guild Helper

[![CI](https://github.com/remziay-telenity/base/actions/workflows/ci.yml/badge.svg)](https://github.com/remziay-telenity/base/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/remziay-telenity/base)

A web app that helps you complete on-chain roles on [guild.xyz/base](https://guild.xyz/base) — Coinbase's Base network guild.

## What it does

| Feature | Guild roles unlocked |
|---------|----------------------|
| Send a transaction | Onchain, Based: 10/50/100/1,000 transactions |
| Deploy Counter contract | Builders & Founders 1/5/10+ contracts |
| Deploy ERC-20 token | Builders & Founders 1/5/10+ contracts |
| Deploy ERC-721 NFT | Builders & Founders 1/5/10+ contracts |
| Basename checker | Based role |
| ETH holding tracker | Holding $1 / $100 / $1,000 roles |

Connect your wallet → perform the on-chain action → visit [guild.xyz/base](https://guild.xyz/base) with the same wallet to claim your roles. Guild verifies on-chain state automatically.

## Stack

- [Next.js 16](https://nextjs.org/) — React framework
- [wagmi v2](https://wagmi.sh/) + [viem](https://viem.sh/) — Ethereum interactions
- [RainbowKit](https://www.rainbowkit.com/) — wallet connect UI
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [vitest](https://vitest.dev/) — unit tests (40 tests)
- Supports **Base Mainnet** (8453) and **Base Sepolia** (84532) testnet

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/remziay-telenity/base
cd base
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
# Required — get free at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional — get free at https://basescan.org/myapikey
# Enables deployed contracts count; tx count falls back to on-chain nonce without it
NEXT_PUBLIC_BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Run

```bash
npm run dev      # starts dev server (auto-compiles contracts first)
npm test         # run 40 unit tests
npm run build    # production build
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/remziay-telenity/base)

Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and `NEXT_PUBLIC_BASESCAN_API_KEY` as environment variables in your Vercel project settings.

## Supported networks

| Network | Chain ID | Purpose |
|---------|----------|---------|
| Base Mainnet | 8453 | Real Guild.xyz roles |
| Base Sepolia | 84532 | Testing (free testnet ETH) |

Get testnet ETH at [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia).

## Project structure

```
contracts/          Solidity sources (Counter, SimpleToken, SimpleNFT)
scripts/            compile.js — builds all contracts to src/lib/*Artifact.json
src/
  app/              Next.js pages and layout
  components/       UI components + *.test.tsx
  hooks/            wagmi/data hooks + *.test.ts
  lib/              Basescan API, wagmi config, compiled artifacts
  providers/        Web3Provider (wagmi + RainbowKit + React Query)
  test/             vitest setup
.github/workflows/  CI pipeline
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
