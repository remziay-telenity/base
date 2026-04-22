import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnchainStats } from "./OnchainStats";

vi.mock("@/hooks/useTransactionStats", () => ({
  useTransactionStats: vi.fn(),
  TX_MILESTONES: [1, 10, 50, 100, 1000],
}));

vi.mock("./TxProgressBar", () => ({
  TxProgressBar: ({ milestone, count }: { milestone: number; count: number }) => (
    <div data-testid={`progress-${milestone}`}>
      {count}/{milestone}
    </div>
  ),
}));

vi.mock("./LoadingSkeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

import { useTransactionStats } from "@/hooks/useTransactionStats";
const mockStats = useTransactionStats as ReturnType<typeof vi.fn>;

describe("OnchainStats", () => {
  it("renders the section heading", () => {
    mockStats.mockReturnValue({
      txCount: 5, ethBalance: "0.1234", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getByText("Your Onchain Stats")).toBeInTheDocument();
  });

  it("displays ETH balance when loaded", () => {
    mockStats.mockReturnValue({
      txCount: 5, ethBalance: "0.5000", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getByText("0.5000 ETH")).toBeInTheDocument();
  });

  it("displays tx count when loaded", () => {
    mockStats.mockReturnValue({
      txCount: 42, ethBalance: "0.1", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows Onchain role badge when balance >= 0.001 and txCount >= 1", () => {
    mockStats.mockReturnValue({
      txCount: 1, ethBalance: "0.0010", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getByText("Onchain role ✓")).toBeInTheDocument();
  });

  it("does not show Onchain role badge when balance is too low", () => {
    mockStats.mockReturnValue({
      txCount: 10, ethBalance: "0.0009", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.queryByText("Onchain role ✓")).not.toBeInTheDocument();
  });

  it("shows skeleton placeholders while loading", () => {
    mockStats.mockReturnValue({
      txCount: null, ethBalance: null, isLoading: true, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("shows error message and Retry button on error", () => {
    mockStats.mockReturnValue({
      txCount: null, ethBalance: null, isLoading: false,
      error: "Failed to fetch transaction count", refetch: vi.fn(),
    });
    render(<OnchainStats />);
    expect(screen.getByText("Failed to fetch transaction count")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders milestone progress bars for each TX_MILESTONE when data is loaded", () => {
    mockStats.mockReturnValue({
      txCount: 15, ethBalance: "0.5", isLoading: false, error: null, refetch: vi.fn(),
    });
    render(<OnchainStats />);
    // TxProgressBar is rendered for each milestone
    expect(screen.getByTestId("progress-1")).toBeInTheDocument();
    expect(screen.getByTestId("progress-10")).toBeInTheDocument();
    expect(screen.getByTestId("progress-1000")).toBeInTheDocument();
  });
});
