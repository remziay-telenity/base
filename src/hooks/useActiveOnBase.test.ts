import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveOnBase } from "./useActiveOnBase";

vi.mock("./useTransactionStats", () => ({
  useTransactionStats: vi.fn(),
}));

import { useTransactionStats } from "./useTransactionStats";
const mockStats = useTransactionStats as ReturnType<typeof vi.fn>;

function setup(txCount: number | null) {
  mockStats.mockReturnValue({
    txCount,
    ethBalance: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
}

describe("useActiveOnBase", () => {
  it("returns all tiers as not achieved when txCount is null", () => {
    setup(null);
    const { result } = renderHook(() => useActiveOnBase());
    expect(result.current.tiers.every((t) => !t.achieved)).toBe(true);
    expect(result.current.currentTier).toBeNull();
  });

  it("achieves Newcomer tier at 1 tx", () => {
    setup(1);
    const { result } = renderHook(() => useActiveOnBase());
    const newcomer = result.current.tiers.find((t) => t.label === "Newcomer");
    expect(newcomer?.achieved).toBe(true);
    expect(result.current.currentTier?.label).toBe("Newcomer");
  });

  it("achieves Regular tier at 10 txs", () => {
    setup(10);
    const { result } = renderHook(() => useActiveOnBase());
    const regular = result.current.tiers.find((t) => t.label === "Regular");
    expect(regular?.achieved).toBe(true);
    expect(result.current.currentTier?.label).toBe("Regular");
  });

  it("achieves Active tier at 50 txs", () => {
    setup(50);
    const { result } = renderHook(() => useActiveOnBase());
    expect(result.current.currentTier?.label).toBe("Active");
  });

  it("achieves Power User tier at 100 txs", () => {
    setup(100);
    const { result } = renderHook(() => useActiveOnBase());
    expect(result.current.currentTier?.label).toBe("Power User");
  });

  it("does not achieve Regular at 9 txs", () => {
    setup(9);
    const { result } = renderHook(() => useActiveOnBase());
    const regular = result.current.tiers.find((t) => t.label === "Regular");
    expect(regular?.achieved).toBe(false);
    expect(result.current.currentTier?.label).toBe("Newcomer");
  });

  it("exposes txCount from useTransactionStats", () => {
    setup(42);
    const { result } = renderHook(() => useActiveOnBase());
    expect(result.current.txCount).toBe(42);
  });

  it("returns 4 tiers total", () => {
    setup(0);
    const { result } = renderHook(() => useActiveOnBase());
    expect(result.current.tiers).toHaveLength(4);
  });
});
