import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDeployedContracts, CONTRACT_MILESTONES } from "./useDeployedContracts";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xOwner", chainId: 8453 }),
}));

vi.mock("@/lib/basescan", () => ({
  fetchDeployedContracts: vi.fn(),
}));

import { fetchDeployedContracts } from "@/lib/basescan";
const mockFetch = fetchDeployedContracts as ReturnType<typeof vi.fn>;

describe("useDeployedContracts", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "test-key";
    mockFetch.mockReset();
  });

  it("starts with no contracts when no API key", () => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "";
    const { result } = renderHook(() => useDeployedContracts());
    expect(result.current.contracts).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches and returns deployed contracts", async () => {
    const contracts = [
      { hash: "0xabc", from: "0xOwner", to: "", contractAddress: "0xCA1", blockNumber: "10", timeStamp: "1000", isError: "0" },
      { hash: "0xdef", from: "0xOwner", to: "", contractAddress: "0xCA2", blockNumber: "11", timeStamp: "1001", isError: "0" },
    ];
    mockFetch.mockResolvedValueOnce(contracts);

    const { result } = renderHook(() => useDeployedContracts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.contracts).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it("sets error string on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API error"));

    const { result } = renderHook(() => useDeployedContracts());

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error).toMatch(/Basescan API key/);
    expect(result.current.contracts).toEqual([]);
  });

  it("refetch triggers another API call", async () => {
    mockFetch.mockResolvedValue([]);

    const { result } = renderHook(() => useDeployedContracts());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.refetch();
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it("exposes CONTRACT_MILESTONES constant", () => {
    expect(CONTRACT_MILESTONES).toEqual([1, 5, 10]);
  });
});
