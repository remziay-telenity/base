/**
 * Formatting utilities for addresses, hashes, ETH amounts, and time.
 */

/**
 * Shorten a hex address: "0x1234…5678"
 */
export function shortAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (address.length <= prefixLen + suffixLen + 1) return address;
  return `${address.slice(0, prefixLen)}…${address.slice(-suffixLen)}`;
}

/**
 * Shorten a tx hash: "0xabcdef…567890"
 */
export function shortHash(hash: string, prefixLen = 8, suffixLen = 6): string {
  if (hash.length <= prefixLen + suffixLen + 1) return hash;
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
}

/**
 * Format a Unix timestamp (seconds) as a human-readable "time ago" string.
 */
export function timeAgo(timestampSeconds: number | string): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestampSeconds);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format an ETH amount to a fixed number of decimal places.
 */
export function formatEth(amount: number | string, decimals = 4): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${n.toFixed(decimals)} ETH`;
}

/**
 * Format a USD amount with $ prefix and 2 decimal places.
 */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a large number with commas (e.g. 1234567 → "1,234,567").
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
