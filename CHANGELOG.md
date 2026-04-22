# Changelog

All notable changes to Base Guild Helper are documented here.

## [Unreleased]

### Added
- ERC-20 (`SimpleToken`) and ERC-721 (`SimpleNFT`) contract deploy templates
- Contract type selector in Deploy panel (Counter / ERC-20 / ERC-721)
- `BasenameChecker` — resolves Basename from Base L2 reverse resolver
- `HoldingTracker` — live ETH/USD balance with $1/$100/$1,000 milestones
- `BridgeLinks` — quick links to Base Bridge, faucet, Coinbase, Basename registration
- `OnchainStats` — live transaction count with milestone progress bars
- Skeleton loading states across all data-fetching components
- Toast notifications (react-hot-toast) for tx/deploy success and errors
- Retry button on error states
- Mobile-responsive header and layout
- Footer with GitHub, Basescan, and Base Docs links
- 40 unit tests across hooks, utilities, and components
- GitHub Actions CI (type check → tests → build)
- Vercel deployment config

### Stack
- Next.js 16 · wagmi v2 · viem · RainbowKit
- Base Mainnet (8453) + Base Sepolia (84532)
- Tailwind CSS v4 · react-hot-toast · vitest

## [0.1.0] — Initial release

### Added
- Wallet connect via RainbowKit (MetaMask, Coinbase Wallet, WalletConnect, Rainbow)
- **Send Transaction** panel — send ETH on Base to unlock Onchain / Based tx-count roles
- **Deploy Contract** panel — one-click Counter.sol deploy for Builders & Founders roles
- Network banner with mainnet ↔ Sepolia switcher
- Basescan API integration for transaction history and deployed contract tracking
- `useTransactionStats` hook with nonce fallback (no API key required)
- `useDeployedContracts` hook
- Role checklist showing all roles unlockable by app actions
