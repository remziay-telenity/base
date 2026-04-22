import { base } from "wagmi/chains";

const BASESCAN_MAINNET = "https://api.basescan.org/api";
const BASESCAN_SEPOLIA = "https://api-sepolia.basescan.org/api";

function apiUrl(chainId: number) {
  return chainId === base.id ? BASESCAN_MAINNET : BASESCAN_SEPOLIA;
}

export async function fetchTxList(
  address: string,
  chainId: number,
  apiKey: string
) {
  const url = new URL(apiUrl(chainId));
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", address);
  url.searchParams.set("startblock", "0");
  url.searchParams.set("endblock", "99999999");
  url.searchParams.set("sort", "asc");
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== "1" && data.message !== "No transactions found") {
    throw new Error(data.message || "Basescan API error");
  }
  return (data.result as TxRecord[]) ?? [];
}

export async function fetchDeployedContracts(
  address: string,
  chainId: number,
  apiKey: string
): Promise<TxRecord[]> {
  const txs = await fetchTxList(address, chainId, apiKey);
  // Contract creations have an empty "to" field
  return txs.filter((tx) => tx.to === "" && tx.contractAddress !== "");
}

export interface TxRecord {
  hash: string;
  to: string;
  contractAddress: string;
  blockNumber: string;
  timeStamp: string;
  isError: string;
}
