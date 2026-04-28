// Uniswap V3 on Base mainnet (chainId 8453)
// Refs:
//   SwapRouter02:  https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments
//   QuoterV2:      same
//
// We expose a small curated token list and a per-pair fee tier so we don't
// need an off-chain pool indexer. ETH is treated as a synthetic entry that
// uses WETH under the hood (SwapRouter02 wraps/unwraps for us).

export const SWAP_ROUTER_02 = "0x2626664c2603336E57B271c5C0b26F421741e481" as const;
export const QUOTER_V2 = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a" as const;
export const WETH_BASE = "0x4200000000000000000000000000000000000006" as const;

export type Token = {
  symbol: string;
  address: `0x${string}`; // for ETH this is the WETH address (used in pool routing)
  decimals: number;
  isNative?: boolean;
};

export const TOKENS: Token[] = [
  { symbol: "ETH", address: WETH_BASE, decimals: 18, isNative: true },
  { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  { symbol: "cbBTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8 },
];

// Pool fee tier (in hundredths of a bip) for each unordered pair, by symbol.
const PAIR_FEE: Record<string, number> = {
  "ETH/USDC": 500,
  "ETH/cbBTC": 3000,
  "USDC/cbBTC": 3000,
};

export function getPoolFee(a: Token, b: Token): number | null {
  const k1 = `${a.symbol}/${b.symbol}`;
  const k2 = `${b.symbol}/${a.symbol}`;
  return PAIR_FEE[k1] ?? PAIR_FEE[k2] ?? null;
}

export const ERC20_ABI = [
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

// QuoterV2.quoteExactInputSingle is marked non-view in Solidity but is safe
// to call via eth_call (it reverts state at the end).
export const QUOTER_V2_ABI = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [{
      name: "params",
      type: "tuple",
      components: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "amountIn", type: "uint256" },
        { name: "fee", type: "uint24" },
        { name: "sqrtPriceLimitX96", type: "uint160" },
      ],
    }],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

// SwapRouter02 — note no `deadline` in the struct (vs. v1 router).
export const SWAP_ROUTER_02_ABI = [
  {
    type: "function",
    name: "exactInputSingle",
    stateMutability: "payable",
    inputs: [{
      name: "params",
      type: "tuple",
      components: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "recipient", type: "address" },
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMinimum", type: "uint256" },
        { name: "sqrtPriceLimitX96", type: "uint160" },
      ],
    }],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "multicall",
    stateMutability: "payable",
    inputs: [{ name: "data", type: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]" }],
  },
  {
    type: "function",
    name: "unwrapWETH9",
    stateMutability: "payable",
    inputs: [
      { name: "amountMinimum", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
] as const;
