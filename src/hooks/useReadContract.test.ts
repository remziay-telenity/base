import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReadContract } from "./useReadContract";
import { type Abi } from "viem";

const rpc = { readContract: vi.fn() };

vi.mock("wagmi", () => ({
  usePublicClient: () => rpc,
}));

const DUMMY_ABI: Abi = [
  {
    name: "count",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
];
const CONTRACT_ADDR = "0xCounterContract" as `0x${string}`;

describe("useReadContract", () => {
  beforeEach(() => {
    rpc.readContract.mockReset();
  });

  it("returns null data when contractAddress is undefined", () => {
    const { result } = renderHook(() =>
      useReadContract(undefined, DUMMY_ABI, "count")
    );
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it("fetches data on mount", async () => {
    rpc.readContract.mockResolvedValueOnce(42n);

    const { result } = renderHook(() =>
      useReadContract<bigint>(CONTRACT_ADDR, DUMMY_ABI, "count")
    );

    await waitFor(() => expect(result.current.data).toBe(42n));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on read failure", async () => {
    rpc.readContract.mockRejectedValueOnce(new Error("revert: not allowed"));

    const { result } = renderHook(() =>
      useReadContract(CONTRACT_ADDR, DUMMY_ABI, "count")
    );

    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/revert/i);
    expect(result.current.data).toBeNull();
  });

  it("refetch triggers a new read", async () => {
    rpc.readContract.mockResolvedValue(0n);

    const { result } = renderHook(() =>
      useReadContract(CONTRACT_ADDR, DUMMY_ABI, "count")
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    result.current.refetch();
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(2));
  });

  it("calls readContract with correct params", async () => {
    rpc.readContract.mockResolvedValueOnce(7n);

    renderHook(() => useReadContract(CONTRACT_ADDR, DUMMY_ABI, "count", []));

    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: CONTRACT_ADDR,
        functionName: "count",
      })
    ));
  });
});
