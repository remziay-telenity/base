import { base } from "wagmi/chains";

export function explorerUrl(chainId: number | undefined): string {
  return chainId === base.id
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";
}

export function txUrl(chainId: number | undefined, hash: string): string {
  return `${explorerUrl(chainId)}/tx/${hash}`;
}

export function addressUrl(chainId: number | undefined, address: string): string {
  return `${explorerUrl(chainId)}/address/${address}`;
}
