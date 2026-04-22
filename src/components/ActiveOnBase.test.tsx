import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActiveOnBase } from "./ActiveOnBase";

vi.mock("@/hooks/useActiveOnBase", () => ({
  useActiveOnBase: vi.fn(),
}));

import { useActiveOnBase } from "@/hooks/useActiveOnBase";
const mockHook = useActiveOnBase as ReturnType<typeof vi.fn>;

const TIERS = [
  { label: "Newcomer",   minTxs: 1,   achieved: true },
  { label: "Regular",    minTxs: 10,  achieved: false },
  { label: "Active",     minTxs: 50,  achieved: false },
  { label: "Power User", minTxs: 100, achieved: false },
];

describe("ActiveOnBase", () => {
  it("renders the heading", () => {
    mockHook.mockReturnValue({
      tiers: TIERS,
      currentTier: TIERS[0],
      txCount: 1,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    expect(screen.getByText("Active on Base")).toBeInTheDocument();
  });

  it("shows current tier badge when a tier is achieved", () => {
    mockHook.mockReturnValue({
      tiers: TIERS,
      currentTier: TIERS[0],
      txCount: 1,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    expect(screen.getByText("Newcomer")).toBeInTheDocument();
  });

  it("does not show tier badge when no tier is achieved", () => {
    mockHook.mockReturnValue({
      tiers: TIERS.map((t) => ({ ...t, achieved: false })),
      currentTier: null,
      txCount: 0,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    // All tier labels appear in the grid — the badge specifically renders in a rounded-full pill
    const pills = screen.queryAllByText("Newcomer");
    // There should be exactly one "Newcomer" (in tier list, no badge)
    expect(pills.length).toBe(1);
  });

  it("shows progress text for unachieved tiers", () => {
    mockHook.mockReturnValue({
      tiers: TIERS,
      currentTier: TIERS[0],
      txCount: 1,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    expect(screen.getByText("1 / 10 txs")).toBeInTheDocument();
  });

  it("shows error and retry button on error", () => {
    mockHook.mockReturnValue({
      tiers: TIERS,
      currentTier: null,
      txCount: null,
      isLoading: false,
      error: "Failed to fetch transaction count",
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    expect(screen.getByText("Failed to fetch transaction count")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows tx count summary at the bottom", () => {
    mockHook.mockReturnValue({
      tiers: TIERS,
      currentTier: TIERS[0],
      txCount: 5,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<ActiveOnBase />);
    expect(screen.getByText(/5 outgoing transactions on Base/)).toBeInTheDocument();
  });
});
