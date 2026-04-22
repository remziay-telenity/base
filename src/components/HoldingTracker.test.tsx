import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoldingTracker } from "./HoldingTracker";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x123" }),
  useBalance: () => ({
    data: { formatted: "0.5", symbol: "ETH" },
  }),
}));

vi.mock("@/hooks/useEthPrice", () => ({
  useEthPrice: () => ({ price: 3000, isLoading: false }),
}));

describe("HoldingTracker", () => {
  it("renders the section heading", () => {
    render(<HoldingTracker />);
    expect(screen.getByText("Asset Holdings")).toBeInTheDocument();
  });

  it("shows all three milestone labels", () => {
    render(<HoldingTracker />);
    expect(screen.getByText(/Hold \$1\+/)).toBeInTheDocument();
    expect(screen.getByText(/Hold \$100\+/)).toBeInTheDocument();
    expect(screen.getByText(/Hold \$1,000\+/)).toBeInTheDocument();
  });

  it("shows ETH balance", () => {
    render(<HoldingTracker />);
    expect(screen.getByText(/0\.5.*ETH/)).toBeInTheDocument();
  });

  it("shows calculated USD value (0.5 ETH × $3000 = $1500)", () => {
    render(<HoldingTracker />);
    expect(screen.getByText("$1500.00")).toBeInTheDocument();
  });

  it("marks $1 and $100 milestones as complete when balance is $1500", () => {
    render(<HoldingTracker />);
    const completeItems = screen.getAllByText("complete");
    expect(completeItems.length).toBeGreaterThanOrEqual(2);
  });

  it("shows the data source attribution", () => {
    render(<HoldingTracker />);
    expect(screen.getByText(/CoinGecko/)).toBeInTheDocument();
  });
});
