import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTxHistory } from "./useTxHistory";

const MOCK_ADDRESS = "0xUserAddress";
const MOCK_CHAIN_ID = 8453;

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: MOCK_ADDRESS, chainId: MOCK_CHAIN_ID }),
}));

vi.mock("@/lib/basescan", () => ({
  fetchTxList: vi.fn(),
}));

import { fetchTxList } from "@/lib/basescan";
const mockFetch = fetchTxList as ReturnType<typeof vi.fn>;

const makeOutgoing = (hash: string, timeStamp: string, isError = "0") => ({
  hash,
  from: MOCK_ADDRESS.toLowerCase(),
  to: "0xrecipient",
  contractAddress: "",
  blockNumber: "100",
  timeStamp,
  isError,
});

describe("useTxHistory", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "test-key";
    mockFetch.mockReset();
  });

  it("starts with empty txs and not loading when no address/apiKey", () => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "";
    const { result } = renderHook(() => useTxHistory());
    expect(result.current.txs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches and returns outgoing txs sorted newest first", async () => {
    const txs = [
      makeOutgoing("0xaaa", "1000"),
      makeOutgoing("0xbbb", "2000"),
      makeOutgoing("0xccc", "3000"),
    ];
    mockFetch.mockResolvedValueOnce(txs);

    const { result } = renderHook(() => useTxHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Most recent first (reversed)
    expect(result.current.txs[0].hash).toBe("0xccc");
    expect(result.current.txs[1].hash).toBe("0xbbb");
    expect(result.current.txs[2].hash).toBe("0xaaa");
  });

  it("filters out incoming transactions", async () => {
    const txs = [
      makeOutgoing("0xout", "1000"),
      { hash: "0xin", from: "0xsomeone_else", to: MOCK_ADDRESS, contractAddress: "", blockNumber: "101", timeStamp: "1001", isError: "0" },
    ];
    mockFetch.mockResolvedValueOnce(txs);

    const { result } = renderHook(() => useTxHistory());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.txs).toHaveLength(1);
    expect(result.current.txs[0].hash).toBe("0xout");
  });

  it("respects the limit parameter", async () => {
    const txs = Array.from({ length: 20 }, (_, i) =>
      makeOutgoing(`0x${i.toString().padStart(2, "0")}`, String(i))
    );
    mockFetch.mockResolvedValueOnce(txs);

    const { result } = renderHook(() => useTxHistory(5));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.txs).toHaveLength(5);
  });

  it("sets error on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useTxHistory());

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error).toBe("Failed to load transaction history");
    expect(result.current.txs).toEqual([]);
  });

  it("refetch triggers a new API call", async () => {
    mockFetch.mockResolvedValue([]);

    const { result } = renderHook(() => useTxHistory());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.refetch();
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });
});
