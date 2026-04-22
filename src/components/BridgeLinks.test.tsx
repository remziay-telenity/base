import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BridgeLinks } from "./BridgeLinks";

vi.mock("wagmi", () => ({
  useAccount: () => ({ chainId: 8453 }), // Base mainnet
}));

describe("BridgeLinks", () => {
  it("renders the section heading", () => {
    render(<BridgeLinks />);
    expect(screen.getByText("Useful Links")).toBeInTheDocument();
  });

  it("renders Base Bridge link on mainnet", () => {
    render(<BridgeLinks />);
    expect(screen.getByText("Base Bridge")).toBeInTheDocument();
  });

  it("renders faucet link", () => {
    render(<BridgeLinks />);
    expect(screen.getByText("Base Sepolia Faucet")).toBeInTheDocument();
  });

  it("renders Coinbase buy ETH link", () => {
    render(<BridgeLinks />);
    expect(screen.getByText("Coinbase")).toBeInTheDocument();
  });

  it("all links open in a new tab", () => {
    render(<BridgeLinks />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
