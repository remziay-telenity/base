import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBasename } from "./useBasename";

// readContract lives in a shared object so the factory can reference it
// without TDZ issues (vi.mock is hoisted before const declarations)
const rpc = { readContract: vi.fn() };

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  usePublicClient: () => rpc,
}));

import { useAccount } from "wagmi";
const mockAccount = useAccount as ReturnType<typeof vi.fn>;

describe("useBasename", () => {
  beforeEach(() => {
    rpc.readContract.mockReset();
  });

  it("returns null basename when not on Base mainnet (Sepolia)", () => {
    mockAccount.mockReturnValue({ address: "0xuser", chainId: 84532 });
    const { result } = renderHook(() => useBasename());
    expect(result.current.basename).toBeNull();
    expect(result.current.hasBasename).toBe(false);
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it("returns null when address is missing", () => {
    mockAccount.mockReturnValue({ address: undefined, chainId: 8453 });
    const { result } = renderHook(() => useBasename());
    expect(result.current.basename).toBeNull();
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it("resolves basename on Base mainnet (chainId 8453)", async () => {
    mockAccount.mockReturnValue({ address: "0xAbCdEf1234", chainId: 8453 });
    rpc.readContract.mockResolvedValueOnce("alice.base.eth");

    const { result } = renderHook(() => useBasename());

    await waitFor(() => expect(result.current.basename).toBe("alice.base.eth"));
    expect(result.current.hasBasename).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns null basename when resolver returns empty string", async () => {
    mockAccount.mockReturnValue({ address: "0xNoBasename", chainId: 8453 });
    rpc.readContract.mockResolvedValueOnce("");

    const { result } = renderHook(() => useBasename());

    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.basename).toBeNull();
    expect(result.current.hasBasename).toBe(false);
  });

  it("returns null and stops loading on resolver error", async () => {
    mockAccount.mockReturnValue({ address: "0xErrAddr", chainId: 8453 });
    rpc.readContract.mockRejectedValueOnce(new Error("contract error"));

    const { result } = renderHook(() => useBasename());

    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.basename).toBeNull();
  });
});
