import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContractInteraction } from "./useContractInteraction";
import { type Abi } from "viem";

const mockWriteContract = vi.fn();
const mockResetWrite = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useWriteContract: () => ({
    writeContract: mockWriteContract,
    data: undefined,
    isPending: false,
    reset: mockResetWrite,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
}));

import { useAccount } from "wagmi";
const mockAccount = useAccount as ReturnType<typeof vi.fn>;

const DUMMY_ABI: Abi = [
  {
    name: "increment",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const CONTRACT_ADDR = "0xContractAddress1234" as `0x${string}`;

describe("useContractInteraction", () => {
  beforeEach(() => {
    mockWriteContract.mockReset();
    mockResetWrite.mockReset();
    mockAccount.mockReturnValue({ address: "0xUser", chainId: 8453 });
  });

  it("starts with no error, no txHash, not pending", () => {
    const { result } = renderHook(() =>
      useContractInteraction(CONTRACT_ADDR, DUMMY_ABI, "increment")
    );
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeUndefined();
    expect(result.current.isPending).toBe(false);
  });

  it("calls writeContract when write() is invoked with a connected wallet", () => {
    const { result } = renderHook(() =>
      useContractInteraction(CONTRACT_ADDR, DUMMY_ABI, "increment")
    );
    act(() => {
      result.current.write();
    });
    expect(mockWriteContract).toHaveBeenCalledTimes(1);
    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: CONTRACT_ADDR,
        functionName: "increment",
      }),
      expect.any(Object)
    );
  });

  it("sets error and does not call writeContract when wallet not connected", () => {
    mockAccount.mockReturnValue({ address: undefined, chainId: 8453 });
    const { result } = renderHook(() =>
      useContractInteraction(CONTRACT_ADDR, DUMMY_ABI, "increment")
    );
    act(() => {
      result.current.write();
    });
    expect(result.current.error).toMatch(/wallet not connected/i);
    expect(mockWriteContract).not.toHaveBeenCalled();
  });

  it("sets error when contractAddress is undefined", () => {
    const { result } = renderHook(() =>
      useContractInteraction(undefined, DUMMY_ABI, "increment")
    );
    act(() => {
      result.current.write();
    });
    expect(result.current.error).toBeTruthy();
    expect(mockWriteContract).not.toHaveBeenCalled();
  });

  it("passes args to writeContract", () => {
    const { result } = renderHook(() =>
      useContractInteraction(CONTRACT_ADDR, DUMMY_ABI, "increment")
    );
    act(() => {
      result.current.write([42n]);
    });
    expect(mockWriteContract).toHaveBeenCalledWith(
      expect.objectContaining({ args: [42n] }),
      expect.any(Object)
    );
  });

  it("reset() clears error and calls wagmi reset", () => {
    mockAccount.mockReturnValue({ address: undefined, chainId: 8453 });
    const { result } = renderHook(() =>
      useContractInteraction(CONTRACT_ADDR, DUMMY_ABI, "increment")
    );
    act(() => { result.current.write(); }); // sets error
    expect(result.current.error).toBeTruthy();
    act(() => { result.current.reset(); });
    expect(result.current.error).toBeNull();
    expect(mockResetWrite).toHaveBeenCalledTimes(1);
  });
});
